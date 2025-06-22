import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Mic, 
  Video, 
  Trophy, 
  BarChart3, 
  Users, 
  Target, 
  Zap, 
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  TrendingUp,
  Award,
  Globe,
  Lightbulb
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Real-time Speech Analysis",
      description: "Get instant feedback on your speaking pace, tone, and clarity as you present."
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Visual Presentation Coaching",
      description: "AI-powered analysis of your body language, gestures, and visual engagement."
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Elo Rating System",
      description: "Track your progress with our competitive rating system that adapts to your skill level."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Detailed Analytics",
      description: "Comprehensive insights into your presentation strengths and areas for improvement."
    }
  ];

  const benefits = [
    "Overcome presentation anxiety with confidence-building exercises",
    "Master the art of storytelling and audience engagement",
    "Develop powerful body language and non-verbal communication",
    "Learn to handle questions and objections effectively",
    "Build credibility and professional presence",
    "Increase your influence and persuasive abilities"
  ];

  const stats = [
    { number: "75%", label: "of people fear public speaking" },
    { number: "60%", label: "of communication is non-verbal" },
    { number: "3x", label: "more likely to be promoted with strong presentation skills" },
    { number: "90%", label: "of successful leaders are excellent communicators" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Head>
        <title>Eloquence.AI - Master Public Speaking with AI</title>
        <meta name="description" content="Transform your presentation skills with AI-powered real-time feedback. Master public speaking, overcome anxiety, and become a confident communicator." />
      </Head>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🗣️ Eloquence.AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
              <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Master the Art of
              <span className="text-blue-600 block">Public Speaking</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Transform your presentation skills with AI-powered real-time feedback. 
              Overcome anxiety, build confidence, and become a compelling communicator.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <button className="flex items-center px-6 py-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Public Speaking Matters */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Public Speaking Skills Matter
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              In today's world, the ability to communicate effectively is more valuable than ever. 
              Whether you're presenting to clients, leading a team, or speaking at events, 
              strong presentation skills can open doors and accelerate your career.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <Target className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Career Advancement</h3>
              </div>
              <p className="text-gray-600">
                Professionals with strong presentation skills are 3x more likely to be promoted 
                and earn higher salaries throughout their careers.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <Globe className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Leadership Development</h3>
              </div>
              <p className="text-gray-600">
                Great leaders are great communicators. Develop the skills to inspire, 
                motivate, and lead teams with confidence and clarity.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <Lightbulb className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Innovation & Influence</h3>
              </div>
              <p className="text-gray-600">
                Present your ideas with impact. Learn to persuade, influence decisions, 
                and drive change through compelling communication.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Learning Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced AI technology provides personalized feedback and coaching 
              to help you improve faster than traditional methods.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              What You'll Learn
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Comprehensive training to transform you into a confident, 
              engaging, and persuasive public speaker.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <span className="text-lg">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold mb-4"
          >
            Ready to Transform Your Speaking Skills?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl mb-8 opacity-90"
          >
            Join thousands of professionals who have already improved their presentation skills 
            with Eloquence.AI. Start your journey today.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free Trial
            </Link>
            <Link href="/login" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">🗣️ Eloquence.AI</h3>
              <p className="text-gray-400">
                Transforming public speaking with AI-powered feedback and coaching.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Eloquence.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 