// import React from 'react'
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import HomeImage from "../../assets/Home.svg";

function Body() {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <div className="w-full my-4 min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-3xl flex flex-col gap-4 items-center text-center">
        <img src={HomeImage} width="50%" alt="Home Image" />
        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold">
          Inventory Management
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-white/80">
          Easy to use. Create your inventory items with just a few clicks. Keep
          track of your stock and manage your inventory efficiently.
        </p>

        <Link to={`/${user.role}/dashboard`}>
          <Button
            variant="outlined"
            sx={{
              borderRadius: "30px",
              backgroundColor: "blue",
              color: "white",
              px: 3,
              boxShadow: "0 6px 10px rgba(0, 0, 0, 0.25)",

              "&:hover": {
                backgroundColor: "#4f46e5",
                color: "white",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.35)",
              },

              transition: "all 0.3s ease",
            }}
          >
            Get started
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Body;
