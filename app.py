import streamlit as st
import google.generativeai as genai

# This looks for your API Key in Streamlit's "Secrets"
api_key = st.secrets["GOOGLE_API_KEY"]
genai.configure(api_key=api_key)

st.title("My AI Project 🤖")
st.write("Welcome to my first AI app!")

# Create a text box for your friends to type in
user_prompt = st.text_input("Ask me anything:", placeholder="Type here...")

if st.button("Run AI"):
    if user_prompt:
        # We use 'gemini-1.5-flash' because it's fast and free
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        with st.spinner("Thinking..."):
            response = model.generate_content(user_prompt)
            st.success("Here is the response:")
            st.write(response.text)
    else:
        st.error("Please enter a prompt first!")
