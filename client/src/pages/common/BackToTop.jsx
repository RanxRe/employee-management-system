
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);

        // Check the initial scroll position.
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    if (!isVisible) return null;

    return (
        <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Back to top"
            className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:scale-110 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            <ArrowUp size={20} />
        </button>
    );
}