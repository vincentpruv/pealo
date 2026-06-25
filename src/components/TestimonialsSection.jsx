'use client'

import { GradientStar } from './GradientStar'

const reviews = [
    { name: "Marie, PM at TechFlow", text: "It's magic! We finally have all our user feedback centralized in one place.", rating: 5 },
    { name: "Julien, CEO of SaaSify", text: "A brilliant idea for prioritizing our roadmap. Users love the widget.", rating: 5 },
    { name: "Sophie, Dev Lead", text: "The quality of technical logs included in the tickets is impressive; it saves us a ton of time.", rating: 5 },
]

export default function TestimonialsSection() {
    return (
        <section className="py-24 bg-white" id="testimonials">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    They love Pealo
                </h2>
                <p className="text-lg text-gray-600">
                    Thousands of users heard and understood
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((review, i) => (
                        <div key={i} className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex gap-0.5 mb-3">
                                {[...Array(review.rating)].map((_, j) => (
                                    <GradientStar key={j} className="w-5 h-5" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-4 text-sm leading-relaxed">"{review.text}"</p>
                            <p className="text-sm font-bold text-gray-900">{review.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
