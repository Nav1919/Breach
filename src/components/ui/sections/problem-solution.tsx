"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface ProblemCardProps {
  title: string;
  description: string;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <motion.h2 
    className="text-4xl font-semibold text-center mb-12 text-spektr-cyan-50"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    {children}
  </motion.h2>
);

const ProblemCard = ({ title, description }: ProblemCardProps) => (
  <Card className="p-8 bg-[#0a0e17]/90 backdrop-blur-md border-[#1e2330] h-[250px] flex flex-col">
    <h3 className="text-2xl font-semibold mb-4 text-white">{title}</h3>
    <p className="text-gray-400 text-base leading-relaxed">{description}</p>
  </Card>
);

const FeatureCard = ({ title, description }: ProblemCardProps) => (
  <Card className="p-6 bg-[#0a0e17]/90 backdrop-blur-md border-[#1e2330] hover:border-spektr-cyan-50 transition-colors h-[200px] flex flex-col">
    <h3 className="text-xl font-semibold mb-3 text-spektr-cyan-50">{title}</h3>
    <p className="text-gray-400 text-base leading-relaxed">{description}</p>
  </Card>
);

const Divider = () => (
  <div className="w-full flex justify-center">
    <motion.div 
      className="h-px w-32 bg-gradient-to-r from-transparent via-[#1e2330] to-transparent"
      initial={{ opacity: 0, width: "0%" }}
      whileInView={{ opacity: 1, width: "8rem" }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    />
  </div>
);

export function ProblemSolution() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 20
      }
    }
  };

  return (
    <section className="w-full bg-[#0a0e17]">
      <div className="container mx-auto px-4 py-24">
        {/* Problems Section */}
        <div>
          <SectionTitle>The Problem</SectionTitle>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid gap-8 md:grid-cols-3"
          >
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <ProblemCard
                title="Novel Idea Generation is Hard"
                description="The biggest barrier to idea generation is domain expertise and understanding the field's edge. Current technologies lack evidence-based insights and produce repetitive ideas."
              />
            </motion.div>
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <ProblemCard
                title="Information Overload"
                description="Researchers and entrepreneurs are overwhelmed by the vast amount of papers and patents available, making it difficult to identify promising opportunities."
              />
            </motion.div>
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <ProblemCard
                title="Disconnected Domains"
                description="There's a gap between academic research and industrial applications, preventing the translation of breakthroughs into practical innovations."
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="my-32">
          <Divider />
        </div>

        {/* Solution Section */}
        <div>
          <SectionTitle>Our Solution</SectionTitle>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center"
          >
            <motion.p variants={itemVariants} className="text-2xl md:text-3xl max-w-3xl mx-auto text-white leading-relaxed">
              We built an AI-powered innovation explorer that revolutionizes how researchers and entrepreneurs discover breakthrough technologies. Our platform seamlessly connects the worlds of academic research and industrial patents, powered by cutting-edge AI technology.
            </motion.p>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="my-32">
          <Divider />
        </div>

        {/* Features Section */}
        <div>
          <SectionTitle>Key Features</SectionTitle>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid gap-8 md:grid-cols-3"
          >
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <FeatureCard
                title="Smart Discovery"
                description="Instantly search through thousands of academic papers and patents to find hidden connections."
              />
            </motion.div>
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <FeatureCard
                title="AI-Powered Insights"
                description="Generate clear, actionable insights from dense academic and patent documents."
              />
            </motion.div>
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <FeatureCard
                title="Real-World Impact"
                description="Accelerate innovation by connecting academic insights with practical applications."
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 