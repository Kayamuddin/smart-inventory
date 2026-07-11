import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slice/authSlice.js";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";

function Home() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  return (
    <>
      <div>Hello {user?.name}</div>
      <Button
        variant="contained"
        startIcon={<LogoutIcon />}
        onClick={() => dispatch(logout())}
      >
        logout
      </Button>
      <br />
      <Link to="/admin/dashboard" className="text-blue-500">
        Go to Admin Dashboard
      </Link>
    </>
  );
}

export default Home;
