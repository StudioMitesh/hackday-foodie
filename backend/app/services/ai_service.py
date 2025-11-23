from openai import OpenAI
import os
import json
from typing import List, Dict

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required")

client = OpenAI(api_key=OPENAI_API_KEY)

async def extract_ingredients(image_url: str) -> List[str]:
    """
    Use OpenAI Vision API to extract ingredients from an image.
    Returns a list of ingredient names (lowercase).
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Extract all food ingredients visible in this image. Return a JSON array of ingredient names, lowercase. Only return the JSON array, nothing else."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            }
                        }
                    ]
                }
            ],
            max_tokens=500,
            temperature=0.3
        )
        
        content = response.choices[0].message.content.strip()
        
        # Parse JSON response
        # Handle cases where response might be wrapped in markdown code blocks
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        ingredients = json.loads(content)
        
        # Ensure it's a list and all items are strings
        if isinstance(ingredients, list):
            return [str(ing).lower().strip() for ing in ingredients if ing]
        else:
            return []
            
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}, content: {content}")
        # Fallback: try to extract from text
        return []
    except Exception as e:
        print(f"Error extracting ingredients: {e}")
        raise Exception(f"Failed to extract ingredients: {str(e)}")

async def generate_recipes(ingredients: List[str]) -> List[Dict]:
    """
    Generate 2-3 recipes using the provided ingredients.
    Returns a list of recipe dictionaries.
    """
    try:
        ingredients_str = ", ".join(ingredients)
        
        prompt = f"""Generate 2-3 simple recipes using the following ingredients: {ingredients_str}

Return a JSON array of recipes in this exact format:
[
  {{
    "name": "Recipe Name",
    "description": "Brief description",
    "steps": ["Step 1", "Step 2", "Step 3"]
  }}
]

Only return the JSON array, nothing else."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using mini for cost efficiency
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful cooking assistant. Generate simple, practical recipes."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=1500,
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        
        # Parse JSON response
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        recipes = json.loads(content)
        
        # Ensure it's a list
        if isinstance(recipes, list):
            return recipes[:3]  # Limit to 3 recipes
        else:
            return []
            
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}, content: {content}")
        return []
    except Exception as e:
        print(f"Error generating recipes: {e}")
        raise Exception(f"Failed to generate recipes: {str(e)}")

async def create_embeddings(text: str) -> List[float]:
    """
    Create embeddings for a recipe text using OpenAI embeddings API.
    Returns a list of floats (embedding vector).
    """
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        
        return response.data[0].embedding
        
    except Exception as e:
        print(f"Error creating embeddings: {e}")
        # Return empty list if embeddings fail (optional feature)
        return []

