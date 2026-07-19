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
