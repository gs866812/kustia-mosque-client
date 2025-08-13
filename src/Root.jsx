import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Components/Footer/Footer";
import Header from "./Components/Header/Header";



const Root = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className={`min-h-screen flex flex-col ${isHome ? "overflow-hidden" : ""}`}>
      <header className="shrink-0">
       <Header />
      </header>

      <main className={`flex-1 ${isHome ? "overflow-hidden bg-[#F4F6E8]" : "overflow-auto"}`}>
        <Outlet />
      </main>

      <footer className="shrink-0">
        <Footer/>
      </footer>
    </div>
  );
};

export default Root;
