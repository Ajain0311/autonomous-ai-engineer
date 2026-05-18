import os, random, datetime, time
from google import genai
from google.genai import errors

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash"]

TOPICS = [
    ("python",     "a short Python utility function using only stdlib"),
    ("java",       "a Java utility class with one static helper method"),
    ("javascript", "a small standalone JavaScript helper function"),
    ("python",     "a Python data structure: linked list or stack"),
    ("java",       "a Java algorithm: binary search or bubble sort"),
    ("python",     "a Python algorithm: fibonacci, palindrome, or prime check"),
    ("javascript", "a JavaScript function using array methods like map/filter/reduce"),
    ("java",       "a simple Java POJO class with getters, setters, and toString"),
    ("cpp",        "a C++ function solving a simple competitive programming problem"),
    ("python",     "a Python function that processes and formats a list of data"),
]

EXTENSIONS = {"python": "py", "java": "java", "javascript": "js", "cpp": "cpp"}


def clean(code: str) -> str:
    lines = code.strip().splitlines()
    if lines and lines[0].startswith("```"):
        lines = lines[1:]
    if lines and lines[-1].strip() == "```":
        lines = lines[:-1]
    return "\n".join(lines).strip()


def generate(lang: str, description: str) -> str:
    prompt = (
        f"Write a clean, concise {lang} snippet for: {description}.\n"
        "Rules: self-contained, no external libs, 15-30 lines, "
        "output ONLY the code with no explanation or markdown."
    )
    for attempt in range(1, 7):
        for model in MODELS:
            try:
                resp = client.models.generate_content(model=model, contents=prompt)
                print(f"  model={model} attempt={attempt} OK")
                return clean(resp.text)
            except errors.ClientError as e:
                if e.code == 429:
                    wait = 60 * attempt
                    print(f"  model={model} rate-limited — waiting {wait}s...")
                    time.sleep(wait)
                    break
                else:
                    print(f"  model={model} error {e.code} — trying next model")
    raise RuntimeError("All retries exhausted. Will succeed tomorrow when quota resets.")


lang, description = random.choice(TOPICS)
today = datetime.date.today().isoformat()
ext = EXTENSIONS.get(lang, "txt")
slug = description.split()[2] if len(description.split()) > 2 else description.split()[0]
path = f"{lang}/{today}_{slug}.{ext}"

print(f"Generating {lang}: {description}")
code = generate(lang, description)

os.makedirs(lang, exist_ok=True)
with open(path, "w", encoding="utf-8") as f:
    f.write(code + "\n")

print(f"Written: {path}")
