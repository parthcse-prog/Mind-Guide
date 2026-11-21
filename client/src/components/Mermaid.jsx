import React, { useState, useEffect } from "react";
import mermaid from "mermaid";

const MernRoadmap = () => {
  const [tasks, setTasks] = useState({});
  const [svgContent, setSvgContent] = useState("");

  useEffect(() => {
    const parsedTasks = {};
    const code = `
    graph RL;
A[Front-End Development] --> B(HTML and CSS Basics)
A --> C(JavaScript Fundamentals)
A --> D(React Basics)
D --> E(React Router)
A --> F(Node.js Fundamentals)
F --> G(Express Server Setup)
G --> H(RESTful APIs Basics)
A --> I(Connecting Express with MongoDB)
I --> J(CRUD Operations with MongoDB)
I --> K(Basic Full-Stack Application)
A --> L(User Authentication with JWT)
A --> M(Redux State Management)
A --> N(Deploying MERN App)
N --> O(Cloud Platforms)
A --> P(Personal Project)
P --> Q(Engaging Developer Communities)
    `;

    // Parse the Mermaid code to extract tasks
    const lines = code.split("\n");
    lines.forEach((line) => {
      const matches = line.match(/\[([^\]]+)\]/);
      if (matches && matches.length > 1) {
        parsedTasks[matches[1]] = false;
      }
    });

    setTasks(parsedTasks);

    const renderChart = async () => {
      try {
        mermaid.initialize({ startOnLoad: false, theme: "forest" });
        const { svg } = await mermaid.render(`mern_chart_${Date.now()}`, code);
        setSvgContent(svg);
      } catch (err) {
        console.error("Mermaid error:", err);
      }
    };
    renderChart();
  }, []);

  const handleCheckboxChange = (task) => {
    setTasks((prevTasks) => ({ ...prevTasks, [task]: !prevTasks[task] }));
  };

  const allTasksCompleted = Object.values(tasks).every((task) => task);

  return (
    <div className="max-w-screen-md mx-auto p-8 bg-gray-100 rounded shadow-md">
      <div className="flex items-center justify-center">
        {svgContent ? (
          <div className="w-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
        ) : (
          <p className="text-gray-500 text-sm">Loading roadmap chart...</p>
        )}
      </div>

      <div className="my-4">
        <h2 className="text-lg font-semibold mb-2">Tasks:</h2>
        <div className="grid grid-cols-2 p-2">
          {Object.entries(tasks).map(([task, isChecked]) => (
            <div key={task} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={task}
                checked={isChecked}
                onChange={() => handleCheckboxChange(task)}
                className="mr-2"
              />
              <label htmlFor={task}>{task}</label>
            </div>
          ))}
        </div>
      </div>
      <button
        className={`w-full py-2 rounded-lg text-white ${
          allTasksCompleted ? "bg-slate-600" : "bg-gray-300 cursor-not-allowed"
        }`}
        disabled={!allTasksCompleted}
      >
        {allTasksCompleted ? "Completed" : "Incomplete"}
      </button>
    </div>
  );
};

export default MernRoadmap;
