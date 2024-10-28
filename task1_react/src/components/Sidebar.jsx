import React from "react";
import data from "../data.json";

const Sidebar = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <>
      <div className="sidebar">
        <h2>Things to do in Delhi</h2>
        <div className="categories">
          <label>
            <input type="checkbox" id="select-all" />
            Select All
          </label>
          {data.categories.map((category) => (
            <label key={category.name}>
              <input
                type="checkbox"
                className="category"
                value={category.name}
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
