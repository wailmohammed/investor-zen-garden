
const testimonials = [
  {
    content: "This platform transformed how I manage my investments. The analytics are powerful yet easy to understand, and I've seen tangible improvements in my returns.",
    author: "Sarah L.",
    role: "Individual Investor",
  },
  {
    content: "The dividend tracking feature alone is worth the subscription. I can see exactly what's coming in and plan accordingly. Invaluable for retirement planning.",
    author: "Michael T.",
    role: "Retirement Planner",
  },
  {
    content: "I've tried several investment platforms, but this one stands out with its clean interface and insightful analytics. It's become my go-to tool for portfolio management.",
    author: "David R.",
    role: "Active Trader",
  },
];

const TestimonialSection = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Trusted by investors worldwide
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            See what our users are saying about how our platform has helped them make smarter investment decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <svg className="h-8 w-8 text-finance-blue mb-4" fill="currentColor" viewBox="0 0 32 32">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              <p className="text-gray-600 mb-6">{testimonial.content}</p>
              <div>
                <p className="font-medium text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="mt-2 text-gray-600">4.9 out of 5 stars from over 600 reviews</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;
