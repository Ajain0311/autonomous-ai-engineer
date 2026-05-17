import os, random, datetime, time
from google import genai
from google.genai import errors

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

MODELS = ["gemini-1.5-flash", "gemini-2.0-flash-lite", "gemini-2.0-flash"]

TOPICS = [
    ("python",     "a Python utility function using stdlib — file parser, text processor, or formatter"),
    ("java",       "a Java utility class with a static helper method — string utils, math, or array ops"),
    ("javascript", "a standalone JavaScript function — debounce, deep clone, array grouping, or DOM helper"),
    ("python",     "a Python data structure — linked list, stack, queue, or binary tree implementation"),
    ("java",       "a Java algorithm — sorting, searching, or recursion solution"),
    ("python",     "a Python algorithm — dynamic programming, greedy, or graph traversal"),
    ("javascript", "a JavaScript class using a design pattern — observer, factory, or singleton"),
    ("java",       "a SpringBoot POJO with builder pattern and validation annotations"),
    ("cpp",        "a C++ function solving a classic competitive programming problem"),
    ("python",     "a Python script that processes a list of data and outputs a formatted summary"),
]

EXTENSIONS = {"python": "py", "java": "java", "javascript": "js", "cpp": "cpp"}


def generate(lang: str, description: str) -> str:
    prompt = (
        f"Write clean, production-quality {lang} code for: {description}\n"
        "Rules:\n"
        "- Single self-contained file, no external dependencies\n"
        "- Use proper types/type hints\n"
        "- 20-50 lines of code\n"
        "- Output ONLY the code, no markdown fences, no explanation"
    )
    last_err = None
    for model in MODELS:
        try:
            response = client.models.generate_content(model=model, contents=prompt)
            code = response.text.strip()
            if code.startswith("```"):
                code = "\n".join(code.splitlines()[1:])
            if code.endswith("```"):
                code = "\n".join(code.splitlines()[:-1])
            print(f"Used model: {model}")
            return code.strip()
        except errors.ClientError as e:
            print(f"Model {model} failed: {e.status_code} — trying next")
            last_err = e
            time.sleep(2)
    raise RuntimeError(f"All models failed. Last error: {last_err}")


lang, description = random.choice(TOPICS)
today = datetime.date.today().isoformat()
ext   = EXTENSIONS.get(lang, "txt")
slug  = description.split()[1]
path  = f"{lang}/{today}_{slug}.{ext}"

print(f"Generating {lang}: {description[:55]}...")
code = generate(lang, description)

os.makedirs(lang, exist_ok=True)
with open(path, "w") as f:
    f.write(code + "\n")

print(f"Written: {path}")
