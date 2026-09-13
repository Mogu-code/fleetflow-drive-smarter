import json

with open("seed_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

category_images = {
    "SUV": "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=800&auto=format&fit=crop",
    "Luxury": "https://images.unsplash.com/photo-1503376710356-738690b0e5fa?q=80&w=800&auto=format&fit=crop",
    "Electric": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800&auto=format&fit=crop",
    "Hatchback": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=800&auto=format&fit=crop",
    "Convertible": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
    "MUV": "https://images.unsplash.com/photo-1515569067071-ec3b51335dd0?q=80&w=800&auto=format&fit=crop",
    "Sedan": "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=800&auto=format&fit=crop"
}
default_image = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=800&auto=format&fit=crop"

for v in data.get("vehicles", []):
    img = category_images.get(v.get("category"), default_image)
    if not v.get("image"):
        v["image"] = img
    
    gallery = v.get("gallery", [])
    if gallery:
        for i in range(len(gallery)):
            if not gallery[i]:
                gallery[i] = img
        v["gallery"] = gallery

with open("seed_data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("Images populated successfully!")
