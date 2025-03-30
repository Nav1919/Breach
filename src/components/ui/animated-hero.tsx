import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["artificial intelligence", "finance", "healthcare", "machine learning", "cybersecurity"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full relative min-h-screen flex items-center justify-center">
      <div className="container mx-auto relative z-10">
        <div className="flex gap-8 py-20 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col items-center">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <div className="text-spektr-cyan-50">Find your next startup</div>
              <div className="text-center">in</div>
              <div className="h-20 md:h-24 relative flex w-full justify-center overflow-hidden">
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: 100 }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -100 : 100,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </div>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
            Breach supercharges your brainstorming by pulling startup ideas from millions of patents, research papers, and emerging market trends.
            </p>
          </div>
          <div className="flex flex-row gap-3 mt-4">
            <Link href="/chat">
              <Button size="lg" className="gap-4 z-10">
                Start Breaching <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export { Hero };