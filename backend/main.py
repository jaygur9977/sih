# main.py
import sys
import os

# Add src folder to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from rag_bot import build_vector_store, query_rag

# Step 1: Build vector store if not already present
if not os.path.exists("embeddings/vector_store.pkl"):
    print("Building vector store...")
    build_vector_store()
    print("Vector store built successfully!")

# Step 2: Run CLI loop for queries
print("RAG Chatbot ready! Type 'exit' to quit.\n")
while True:
    user_query = input("Enter your query: ").strip()
    if user_query.lower() in ["exit", "quit"]:
        print("Exiting chatbot.")
        break
    
    answer = query_rag(user_query)
    print("\nHuman-Readable Answer:\n")
    print(answer)
    print("-" * 80)