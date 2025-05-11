"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Video, Bell, BarChart3, DrillIcon as Drone } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState, useRef } from "react"

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  // Track mouse position for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(220, 38, 38, 0.15) 0%, transparent 60%)`,
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            transition: "background-position 0.3s ease-out",
          }}
        ></div>
        <div className="h-full w-full bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Hero Section */}
      <div ref={heroRef} className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated drone icon */}
        <motion.div
          className="absolute opacity-5 z-0"
          style={{
            x: mousePosition.x / 20,
            y: mousePosition.y / 20,
            scale: 5,
            rotate: scrollY / 20,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 120, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <Drone className="w-40 h-40 text-red-500" />
        </motion.div>

        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-zinc-900/50 to-zinc-950 z-0"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-6 inline-block relative">
              <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 opacity-70 blur-xl"></span>
              <h1 className="relative text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
                Drone Detection Security
              </h1>
            </motion.div>

            <motion.p variants={itemVariants} className="text-xl text-zinc-300 mb-8">
              Advanced real-time monitoring and detection system for unauthorized drone activity
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative inline-block group"
                >
                  <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 opacity-0 group-hover:opacity-70 blur transition-all duration-300"></span>
                  <Link href="/dashboard" passHref>
                    <Button
                      size="lg"
                      className="relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-0 shadow-lg shadow-red-900/20"
                    >
                      View Dashboard
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>
              
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-block group"
              >
                <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 opacity-0 group-hover:opacity-70 blur transition-all duration-300"></span>
                <Link href="/cctv" passHref>
                  <Button
                    size="lg"
                    className="relative bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-white border-0 shadow-lg shadow-zinc-900/20"
                  >
                    CCTV Footage
                    <Video className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </div>
              
             
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-zinc-500 flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-red-500"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-3xl font-bold text-center mb-4"
        >
          Key Features
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="w-20 h-1 bg-gradient-to-r from-red-500 to-amber-500 mx-auto mb-12 rounded-full"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-xl border border-zinc-800 shadow-xl shadow-red-900/5 hover:shadow-red-900/10 hover:border-zinc-700 transition-all duration-300"
            >
              <div className="bg-gradient-to-br from-red-900/30 to-amber-900/20 p-3 rounded-xl w-fit mb-4 transform transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                {feature.title}
              </h3>
              <p className="text-zinc-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        className="container mx-auto px-4 py-16 relative z-10"
      >
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-900/50 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-zinc-800 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="flex flex-col items-center"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    delay: 0.3 + index * 0.1,
                    duration: 0.8,
                  }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="text-3xl md:text-4xl font-bold text-red-500 mb-2"
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: "-100px" }}
          className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-8 md:p-12 border border-zinc-800 shadow-2xl relative overflow-hidden"
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 opacity-30">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent"
              animate={{
                x: ["-100%", "100%"],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 8,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-2xl md:text-3xl font-bold mb-4"
            >
              Ready to secure your perimeter?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-zinc-300 mb-8"
            >
              Access the dashboard to view real-time drone detection logs and monitor your security status.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-block group"
              >
                <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 opacity-0 group-hover:opacity-70 blur transition-all duration-300"></span>
                <Link href="/dashboard" passHref>
                  <Button
                    size="lg"
                    className="relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-0 shadow-lg shadow-red-900/20"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-block group"
              >
                <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 opacity-0 group-hover:opacity-70 blur transition-all duration-300"></span>
                <Link href="/cctv" passHref>
                  <Button
                    size="lg"
                    className="relative bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-white border-0 shadow-lg shadow-zinc-900/20"
                  >
                    View CCTV Footage
                    <Video className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8 relative z-10 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center text-zinc-500">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              © {new Date().getFullYear()} Drone Detection Security System. All rights reserved.
            </motion.p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: "Real-time Detection",
    description: "Instantly identify and track unauthorized drone activity in your protected airspace.",
    icon: Shield,
  },
  {
    title: "Video Logging",
    description: "Automatically record and store video evidence of all detected drone incursions.",
    icon: Video,
  },
  {
    title: "Instant Alerts",
    description: "Receive immediate notifications when potential threats are detected.",
    icon: Bell,
  },
  {
    title: "Analytics Dashboard",
    description: "Comprehensive data visualization and reporting of detection patterns.",
    icon: BarChart3,
  },
]

const stats = [
  { value: "99.8%", label: "Detection Accuracy" },
  { value: "< 2s", label: "Response Time" },
  { value: "24/7", label: "Monitoring" },
  { value: "5km", label: "Detection Range" },
]
