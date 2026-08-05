import Body from "../features/Home/Body.jsx";
import NavBar from "../features/Home/Navbar.jsx";

function Home() {
  return (
    <div className="p-4 h-screen bg-violet-700 font-bold">
      <NavBar />
      <Body />
    </div>
  );
}

export default Home;
