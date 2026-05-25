import { useEffect, useState } from "react";

function MoveToTop(){
    const[showButton, setShowButton] = useState(false);

    useEffect(()=>{
        function handleScroll(){
            if(window.scrollY>30){
                setShowButton(true);
            } else{
                setShowButton(false);
            }
        }
        window.addEventListener("scroll", handleScroll);
        return() =>{
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }
    return (
        <>
          {
            showButton && (
                <button className="move-to-top" onClick={scrollToTop}>
                    ↑
                </button>
            )
          }
        </>
    );
}

export default MoveToTop;