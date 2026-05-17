import os, random, datetime
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")

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

def generate(lang, description):
    prompt = f"""Write clean, production-quality {lang} code for: {description}
Rules:
- Single self-contained file, no external dependencies
- Use proper types/type hints
- 20-50 lines of code
- Output ONLY the code, no markdown fences, no explanation"""
    code = model.generate_content(prompt).text.strip()
    if code.startswith("```"):
        code = "\n".join(code.splitlines()[1:])
    if code.endswith("```"):
        code = "\n".join(code.splitlines()[:-1])
    return code.strip()

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
