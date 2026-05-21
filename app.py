def greet(name):
    return f"Hello, {name}!"

greeting = greet("World")
print(greeting)



def reverse_string(s):
    return s[::-1]

reversed_str = reverse_string("Hello, World!")
print(reversed_str)

def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n - 1)

fact_5 = factorial(5)
print(fact_5)

def two_sum(nums, target):
    num_dict = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_dict:
            return [num_dict[complement], i]
        num_dict[num] = i
    return None

result = two_sum([2, 7, 11, 15], 9)
print(result)