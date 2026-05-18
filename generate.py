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

FALLBACKS = {
    "python": """\
def is_palindrome(s: str) -> bool:
    s = s.lower().replace(" ", "")
    return s == s[::-1]

def fibonacci(n: int) -> list:
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

def chunk_list(lst: list, size: int) -> list:
    return [lst[i:i+size] for i in range(0, len(lst), size)]

if __name__ == "__main__":
    print(is_palindrome("racecar"))
    print(fibonacci(10))
    print(chunk_list(list(range(10)), 3))
""",
    "java": """\
public class Utils {
    public static int binarySearch(int[] arr, int target) {
        int lo = 0, hi = arr.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }

    public static void bubbleSort(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++)
            for (int j = 0; j < arr.length - 1 - i; j++)
                if (arr[j] > arr[j+1]) {
                    int tmp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = tmp;
                }
    }
}
""",
    "javascript": """\
const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    const group = item[key];
    acc[group] = acc[group] || [];
    acc[group].push(item);
    return acc;
  }, {});

const flatten = (arr) => arr.reduce((acc, val) =>
  Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);

const unique = (arr) => [...new Set(arr)];

module.exports = { groupBy, flatten, unique };
""",
    "cpp": """\
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
}

vector<int> sieve(int limit) {
    vector<bool> is_prime(limit + 1, true);
    is_prime[0] = is_prime[1] = false;
    for (int i = 2; i * i <= limit; i++)
        if (is_prime[i])
            for (int j = i*i; j <= limit; j += i)
                is_prime[j] = false;
    vector<int> primes;
    for (int i = 2; i <= limit; i++)
        if (is_prime[i]) primes.push_back(i);
    return primes;
}
""",
}


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
    for model in MODELS:
        for attempt in range(1, 3):
            try:
                resp = client.models.generate_content(model=model, contents=prompt)
                print(f"  model={model} attempt={attempt} OK")
                return clean(resp.text)
            except errors.ClientError as e:
                if e.code == 429:
                    if attempt == 1:
                        print(f"  model={model} rate-limited — waiting 65s for quota window to reset...")
                        time.sleep(65)
                    else:
                        print(f"  model={model} still rate-limited — trying next model")
                else:
                    print(f"  model={model} error {e.code} — trying next model")
                    break

    print("  API quota exhausted — using offline fallback snippet")
    return FALLBACKS[lang].strip()


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
