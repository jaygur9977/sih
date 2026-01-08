# from langchain.vectorstores import FAISS
# from langchain.embeddings import OpenAIEmbeddings
# from langchain.chat_models import ChatOpenAI
# from parser import load_json, flatten_scan_data
# import pickle
# import os

# VECTOR_STORE_PATH = "embeddings/vector_store.pkl"
# JSON_PATH = "data/scan_data.json"

# def build_vector_store():
#     data = load_json(JSON_PATH)
#     chunks = flatten_scan_data(data)
    
#     embeddings = OpenAIEmbeddings(model="text-embedding-3-small")  # Replace with Gemini embedding if available
#     import faiss
#     import numpy as np
    
#     vectors = [embeddings.embed_query(chunk) for chunk in chunks]
#     dim = len(vectors[0])
#     index = faiss.IndexFlatL2(dim)
#     index.add(np.array(vectors).astype('float32'))

#     # Save vector store
#     with open(VECTOR_STORE_PATH, 'wb') as f:
#         pickle.dump({"index": index, "chunks": chunks, "dim": dim}, f)

# def load_vector_store():
#     with open(VECTOR_STORE_PATH, 'rb') as f:
#         store = pickle.load(f)
#     return store

# def query_rag(user_query):
#     store = load_vector_store()
#     index = store['index']
#     chunks = store['chunks']
    
#     embeddings = OpenAIEmbeddings(model="text-embedding-3-small")  # Gemini embeddings here
    
#     query_vector = np.array([embeddings.embed_query(user_query)]).astype('float32')
#     D, I = index.search(query_vector, k=3)  # top 3 relevant chunks
    
#     relevant_text = "\n".join([chunks[i] for i in I[0]])
    
#     # Generate human-readable answer
#     chat = ChatOpenAI(model_name="gemini-2.5-flash", temperature=0)
#     prompt = f"User query: {user_query}\nRelevant data: {relevant_text}\nProvide a clear, structured, human-readable answer."
#     response = chat(prompt)
    
#     return response










from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
import pickle
import os
import numpy as np
from parser import load_json, flatten_scan_data
from utils import format_answer
from generate_ai import generate_readable_answer  # Gemini-2.5 Flash integration

VECTOR_STORE_PATH = "embeddings/vector_store.pkl"
JSON_PATH = "data/scan_data.json"

def build_vector_store():
    data = load_json(JSON_PATH)
    chunks = flatten_scan_data(data)
    
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")  # Replace with Gemini embedding if available
    import faiss
    
    vectors = [embeddings.embed_query(chunk) for chunk in chunks]
    dim = len(vectors[0])
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(vectors).astype('float32'))

    # Save vector store
    with open(VECTOR_STORE_PATH, 'wb') as f:
        pickle.dump({"index": index, "chunks": chunks, "dim": dim}, f)

def load_vector_store():
    with open(VECTOR_STORE_PATH, 'rb') as f:
        store = pickle.load(f)
    return store

def query_rag(user_query):
    """
    Retrieves relevant chunks for the query and generates human-readable answer via Gemini-2.5 Flash
    """
    store = load_vector_store()
    index = store['index']
    chunks = store['chunks']
    
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")  # Replace with Gemini embedding if available
    query_vector = np.array([embeddings.embed_query(user_query)]).astype('float32')

    # Retrieve top-3 relevant chunks
    D, I = index.search(query_vector, k=3)
    relevant_text = "\n".join([chunks[i] for i in I[0]])

    # Generate human-readable answer via Gemini-2.5 Flash
    raw_answer = generate_readable_answer(user_query, relevant_text)
    formatted_answer = format_answer(raw_answer)

    return formatted_answer