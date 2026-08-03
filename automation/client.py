import logging
import requests
import json
import time
import re
try:
    from google import genai
    from google.genai import errors, types
    HAS_GENAI = True
except Exception:
    HAS_GENAI = False
    genai = None

from automation import config, quota_tracker

logger = logging.getLogger(__name__)

# Priority order of providers as defined by the specification
PROVIDER_PRIORITY = [
    "gemini",
    "groq",
    "openrouter",
    "together",
    "github",
    "huggingface",
    "sambanova",
    "mistral",
    "cohere",
    "kilo"
]

# Models per provider
PROVIDER_MODELS = {
    "gemini": ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemma-3-27b-it", "gemma-3-12b-it"],
    "groq": ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
    "openrouter": [
        "openrouter/free",
        "google/gemma-2-9b-it:free",
        "meta-llama/llama-3.1-8b-instruct:free",
        "cohere/north-mini-code:free"
    ],
    "together": ["meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", "meta-llama/Llama-3-8b-chat-hf"],
    "github": ["openai/gpt-4o", "meta/llama-3.1-8b-instruct"],
    "huggingface": ["meta-llama/Llama-3.2-1B-Instruct", "google/gemma-2-2b-it"],
    "sambanova": ["Meta-Llama-3.3-70B-Instruct", "Meta-Llama-3.1-405B-Instruct"],
    "mistral": ["open-mistral-7b"],
    "cohere": ["command-r-plus-08-2024"],
    "kilo": ["kilo-auto/free", "meta-llama/llama-3.1-8b-instruct", "openai/gpt-4o-mini"]
}

class APIError(Exception):
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message
        super().__init__(f"API Error {code}: {message}")

class LLMClient:
    def __init__(self, provider: str, api_key: str, index: int):
        self.provider = provider
        self.api_key = api_key
        self.index = index

    def generate(self, model: str, prompt: str, temperature: float, require_json: bool = False) -> str:
        if self.provider == "gemini":
            if not HAS_GENAI:
                raise APIError(500, "google-genai library not loaded")
            try:
                client = genai.Client(api_key=self.api_key)
                if model.startswith("gemma") or not require_json:
                    config_opts = types.GenerateContentConfig(
                        temperature=temperature,
                        max_output_tokens=8192,
                    )
                else:
                    config_opts = types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=temperature,
                        max_output_tokens=16384 if model.startswith("gemini-2.5") else 8192,
                    )
                
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=config_opts,
                )
                try:
                    usage = response.usage_metadata
                    if usage:
                        from automation import state_manager
                        state_manager.record_token_usage(
                            usage.prompt_token_count or 0,
                            usage.candidates_token_count or 0
                        )
                except Exception:
                    pass
                return response.text or ""
            except errors.ClientError as e:
                raise APIError(e.code, getattr(e, "message", "") or str(e))
            except errors.ServerError as e:
                raise APIError(e.code or 500, str(e))
            except Exception as e:
                raise APIError(500, str(e))
        else:
            # OpenAI-compatible API call via requests
            url = ""
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            if self.provider == "groq":
                url = "https://api.groq.com/openai/v1/chat/completions"
            elif self.provider == "openrouter":
                url = "https://openrouter.ai/api/v1/chat/completions"
                headers["HTTP-Referer"] = "https://github.com/Ajain0311/daily-code"
                headers["X-Title"] = "Daily Code Bot"
            elif self.provider == "together":
                url = "https://api.together.xyz/v1/chat/completions"
            elif self.provider == "mistral":
                url = "https://api.mistral.ai/v1/chat/completions"
            elif self.provider == "cohere":
                url = "https://api.cohere.ai/compatibility/v1/chat/completions"
            elif self.provider == "sambanova":
                url = "https://api.sambanova.ai/v1/chat/completions"
            elif self.provider == "kilo":
                url = "https://api.kilo.ai/api/gateway/chat/completions"
            elif self.provider == "github":
                url = "https://models.github.ai/inference/chat/completions"
            elif self.provider == "huggingface":
                url = "https://api-inference.huggingface.co/v1/chat/completions"
            else:
                raise ValueError(f"Unknown provider: {self.provider}")
                
            payload = {
                "model": model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": temperature,
            }
            
            # JSON mode configuration
            is_small_llama = "8b" in model.lower() or "7b" in model.lower() or "3.2-1b" in model.lower()
            if require_json and not (model.startswith("gemma") or is_small_llama):
                payload["response_format"] = {"type": "json_object"}
                
            try:
                resp = requests.post(url, json=payload, headers=headers, timeout=60)
                if resp.status_code == 429:
                    raise APIError(429, resp.text)
                resp.raise_for_status()
                data = resp.json()
                try:
                    usage = data.get("usage")
                    if usage:
                        from automation import state_manager
                        state_manager.record_token_usage(
                            usage.get("prompt_tokens") or 0,
                            usage.get("completion_tokens") or 0
                        )
                except Exception:
                    pass
                return data["choices"][0]["message"]["content"]
            except requests.exceptions.HTTPError as e:
                status_code = e.response.status_code if e.response is not None else 500
                message = e.response.text if e.response is not None else str(e)
                raise APIError(status_code, message)
            except Exception as e:
                raise APIError(500, str(e))

# Build global clients list
_clients: list[LLMClient] = []
client_idx = 0

def init_clients():
    global _clients, client_idx
    _clients = []
    client_idx = 0
    for key in config.GEMINI_API_KEYS:
        _clients.append(LLMClient("gemini", key, client_idx))
        client_idx += 1
    for key in config.GROQ_API_KEYS:
        _clients.append(LLMClient("groq", key, client_idx))
        client_idx += 1
    for key in config.OPENROUTER_API_KEYS:
        _clients.append(LLMClient("openrouter", key, client_idx))
        client_idx += 1
    for key in config.TOGETHER_API_KEYS:
        _clients.append(LLMClient("together", key, client_idx))
        client_idx += 1
    for key in config.MISTRAL_API_KEYS:
        _clients.append(LLMClient("mistral", key, client_idx))
        client_idx += 1
    for key in config.COHERE_API_KEYS:
        _clients.append(LLMClient("cohere", key, client_idx))
        client_idx += 1
    for key in config.SAMBANOVA_API_KEYS:
        _clients.append(LLMClient("sambanova", key, client_idx))
        client_idx += 1
    for key in config.KILO_API_KEYS:
        _clients.append(LLMClient("kilo", key, client_idx))
        client_idx += 1
    for key in config.GITHUB_MODELS_KEYS:
        _clients.append(LLMClient("github", key, client_idx))
        client_idx += 1
    for key in config.HUGGINGFACE_API_KEYS:
        _clients.append(LLMClient("huggingface", key, client_idx))
        client_idx += 1

# Initial load
init_clients()

def _parse_json(text: str) -> dict:
    """Extract and parse JSON from string."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    raise ValueError(f"Cannot parse JSON from response: {text[:300]}")

def get_dynamic_provider_priority() -> list[str]:
    """Helper to dynamically resolve LLM provider call priority from the saved state."""
    try:
        from automation import state_manager
        state = state_manager.load_state()
        p_list = state.get("provider_priority", [])
        if p_list:
            # Ensure elements are valid and merge in case any are missing
            valid = [p for p in p_list if p in PROVIDER_PRIORITY]
            remaining = [p for p in PROVIDER_PRIORITY if p not in valid]
            return valid + remaining
    except Exception:
        pass
    return PROVIDER_PRIORITY

def generate_with_failover(prompt: str, temperature: float = 0.5, require_json: bool = True) -> dict | str:
    """
    Tries to generate completion rotating through providers in priority order.
    Retries up to 3 times on retryable errors (429, 500, 502, 503, 504, timeout, json parse).
    Returns parsed JSON dict if require_json is True, otherwise raw string.
    """
    # Ensure fresh client list
    init_clients()
    
    total_clients = len(_clients)
    if total_clients == 0:
        raise RuntimeError("No LLM API keys configured.")
        
    priority_list = get_dynamic_provider_priority()
    for provider in priority_list:
        # Get active clients for this provider
        active_indices = [
            idx for idx in quota_tracker.active_keys(total_clients) 
            if _clients[idx].provider == provider
        ]
        
        if not active_indices:
            continue
            
        models = PROVIDER_MODELS.get(provider, [])
        if not models:
            continue
            
        logger.info("Attempting provider '%s' with %d active key(s)", provider, len(active_indices))
        
        for key_idx in active_indices:
            client = _clients[key_idx]
            skip_key = False
            for model in models:
                if skip_key:
                    break
                # Up to 3 attempts per key/model combination
                for attempt in range(1, 4):
                    try:
                        logger.info("Running: provider=%s key_idx=%d model=%s attempt=%d", 
                                    provider, key_idx, model, attempt)
                        response_text = client.generate(model, prompt, temperature, require_json=require_json)
                        
                        if not response_text:
                            raise APIError(500, "Empty response from API")
                            
                        quota_tracker.mark_key_success(key_idx)
                        
                        if require_json:
                            result = _parse_json(response_text)
                            return result
                        else:
                            return response_text
                            
                    except (APIError, ValueError, Exception) as exc:
                        code = 500
                        message = str(exc)
                        if isinstance(exc, APIError):
                            code = exc.code
                            message = exc.message
                        
                        logger.warning("Attempt failed: code=%d error=%s", code, message[:150])
                        
                        # Handle rate limiting (429)
                        if code == 429:
                            quota_tracker.mark_key_rate_limited(key_idx, exc)
                            # Move to next key immediately on rate limit
                            skip_key = True
                            break
                        # Handle dead keys (401/403)
                        elif code in (401, 403):
                            quota_tracker.mark_key_dead(key_idx)
                            skip_key = True
                            break
                        # 404 Model not found
                        elif code == 404:
                            quota_tracker.mark_model_unavailable(model)
                            break
                        # Check if error is retryable (5xx, timeouts, malformed JSON)
                        is_retryable = (code >= 500 or code == 408 or isinstance(exc, ValueError))
                        
                        if is_retryable and attempt < 3:
                            sleep_time = attempt * 2
                            logger.info("Retryable error. Sleeping %ds before retry...", sleep_time)
                            time.sleep(sleep_time)
                            continue
                        else:
                            # Not retryable or out of retries, try next key/model
                            break
                            
    raise RuntimeError("All LLM providers and keys exhausted or rate-limited.")
