# 🗺️ My System Mapper

**My System Mapper** is a lightweight, interactive tool for visualizing and mapping systems. Whether you're modeling application architectures, infrastructure components, or process flows, this tool provides an intuitive interface to create, modify, and export visual system diagrams—all in your browser.

## 🚀 Features

- 🔧 Interface to build custom system maps  
- 🔄 Bi-directional connections to represent relationships  
- 💾 Save and load system maps using JSON files  
- 🧠 Intuitive UI with modals for editing and managing components  
- 🧰 Simple local deployment with Node.js

---

## 🖼️ Preview

![screenshot](docs/screenshot.png)  
*Easily map out nodes and their connections right in your browser.*

---

## 📂 Project Structure
my-system-mapper/
├── public/             # Front-end assets (HTML, JS, CSS)
│   ├── index.html      # Main application page
│   ├── js/             # Client-side logic for rendering the map
│   └── css/            # Styling
├── server.js           # Node.js server for hosting the app
├── package.json        # Project metadata and dependencies
├── package-lock.json   # Locked dependency tree
└── node_modules/       # Installed dependencies (auto-generated)
---
## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)

### Installation

```bash
git clone https://github.com/michael-william/my-system-mapper.git
cd my-system-mapper
npm install
```
### Run the App

```bash
node server.js
```
git clone https://github.com/michael-william/my-system-mapper.git
cd my-system-mapper
npm install

Then open your browser and go to:
👉 http://localhost:3000

⸻

📤 Export / Import
	•	Use the Export button to download your system map as a JSON file.
	•	Use the Import button to load a saved JSON and continue where you left off.

⸻

🛠️ Roadmap
	•	MCP Server

⸻

🤝 Contributing

Pull requests are welcome! If you have suggestions, feature requests, or bug fixes, feel free to contribute.

⸻

🧾 License

MIT License

⸻

🙌 Author

Made with ❤️ by Michael William