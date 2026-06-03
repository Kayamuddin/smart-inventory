import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slice/authSlice.js";

function Home() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

    return (
        <>
            <div>
                Hello {user?.name}
            </div>
            <button onClick={() => dispatch(logout())}>logout</button>
        </>
    )
}

export default Home;