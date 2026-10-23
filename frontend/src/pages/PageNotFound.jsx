import { useNavigate } from "react-router-dom";

function PageNotFound() {
  const navigate = useNavigate();
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center select-none">
      <span className="text-red-800 text-9xl">404</span>
      <p>
        Page Not Found. Go to{" "}
        <span
          onClick={() => navigate(-1)}
          className="text-blue-600 cursor-pointer"
        >
          back
        </span>
      </p>
    </div>
  );
}

export default PageNotFound;
