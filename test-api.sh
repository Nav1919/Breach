curl -X POST http://localhost:3000/api/gemini \
-H "Content-Type: application/json" \
-d '{
  "market": "AI/ML",
  "keywords": ["deep learning", "computer vision", "robotics"],
  "niche": "autonomous systems",
  "papers": [
    "Title: Deep Learning in Robotics\nSummary: Recent advances in deep learning for robotic control...",
    "Title: Computer Vision for Autonomous Navigation\nSummary: Novel approaches to visual perception..."
  ],
  "patents": [
    "Title: Robotic Control System\nAbstract: A system for controlling robotic movements...",
    "Title: Autonomous Navigation Method\nAbstract: Method for autonomous vehicle navigation..."
  ]
}' 