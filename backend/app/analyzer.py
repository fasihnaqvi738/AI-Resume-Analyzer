import re

def extract_keywords(text):
    words = re.findall(r'\b[a-zA-Z]+\b', text.lower())

    stopwords = {
        "the","a","an","and","or","to","of","for",
        "in","on","with","is","are","be","as","at"
    }

    return set(
        word for word in words
        if len(word) > 2 and word not in stopwords
    )
    
    
    
    