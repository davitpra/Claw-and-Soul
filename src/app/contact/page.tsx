import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Contact() {
  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root">
      <Navbar />

      <main className="flex-1 flex flex-col justify-start items-center bg-cream">
        <div className="layout-container w-full flex flex-col justify-start items-center py-10 lg:py-16 px-4 md:px-10">
          <div className="layout-content-container flex flex-col max-w-[1200px] w-full gap-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
              <div className="flex max-w-[600px] flex-col gap-4">
                <span className="text-primary font-bold tracking-wider text-sm uppercase">
                  Support
                </span>
                <h1 className="text-text-main text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
                  Get in Touch
                </h1>
                <p className="text-text-muted text-lg font-normal leading-relaxed">
                  We love hearing from fellow pet lovers. Whether it's a
                  question about a custom order or just a cute photo of your
                  dog, drop us a line!
                </p>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-2 text-sm font-medium text-text-main">
                  <span className="material-symbols-outlined text-primary">
                    chat
                  </span>
                  <span>Usually replies within 24 hours</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
              {/* Form Section */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-[#EBE9E4]">
                  <form className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <label className="flex flex-col flex-1 gap-2">
                        <span className="text-text-main text-sm font-bold">
                          Name
                        </span>
                        <input
                          className="w-full rounded-xl border border-[#E0DED9] bg-[#FAFAFA] focus:bg-white focus:border-primary focus:ring-0 h-12 px-4 text-base text-text-main placeholder:text-text-muted/60 transition-all"
                          placeholder="Your Name"
                          type="text"
                        />
                      </label>
                      <label className="flex flex-col flex-1 gap-2">
                        <span className="text-text-main text-sm font-bold">
                          Email
                        </span>
                        <input
                          className="w-full rounded-xl border border-[#E0DED9] bg-[#FAFAFA] focus:bg-white focus:border-primary focus:ring-0 h-12 px-4 text-base text-text-main placeholder:text-text-muted/60 transition-all"
                          placeholder="your@email.com"
                          type="email"
                        />
                      </label>
                    </div>
                    <label className="flex flex-col gap-2">
                      <span className="text-text-main text-sm font-bold">
                        Subject
                      </span>
                      <div className="relative">
                        <select className="w-full rounded-xl border border-[#E0DED9] bg-[#FAFAFA] focus:bg-white focus:border-primary focus:ring-0 h-12 px-4 text-base text-text-main appearance-none transition-all cursor-pointer">
                          <option>General Inquiry</option>
                          <option>Order Status</option>
                          <option>Custom Request</option>
                          <option>Returns & Exchanges</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                          expand_more
                        </span>
                      </div>
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-text-main text-sm font-bold">
                        Message
                      </span>
                      <textarea
                        className="w-full rounded-xl border border-[#E0DED9] bg-[#FAFAFA] focus:bg-white focus:border-primary focus:ring-0 min-h-[160px] p-4 text-base text-text-main placeholder:text-text-muted/60 resize-y transition-all"
                        placeholder="How can we help you create the perfect memory?"
                      ></textarea>
                    </label>
                    <div className="pt-2">
                      <button
                        className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                        type="button"
                      >
                        <span>Send Message</span>
                        <span className="material-symbols-outlined text-[20px]">
                          send
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-[#E6E2DC] rounded-2xl p-8 flex flex-col gap-8">
                  <h3 className="text-xl font-bold text-text-main">
                    Other ways to connect
                  </h3>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center size-10 rounded-full bg-white text-primary shadow-sm shrink-0">
                        <span className="material-symbols-outlined">mail</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-main">
                          Email
                        </span>
                        <a
                          className="text-base text-text-muted hover:text-primary transition-colors"
                          href="mailto:hello@clawandsoul.com"
                        >
                          hello@clawandsoul.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center size-10 rounded-full bg-white text-primary shadow-sm shrink-0">
                        <span className="material-symbols-outlined">call</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-main">
                          Phone
                        </span>
                        <a
                          className="text-base text-text-muted hover:text-primary transition-colors"
                          href="tel:+15551234567"
                        >
                          (555) 123-4567
                        </a>
                        <span className="text-xs text-text-muted mt-1">
                          Mon-Fri, 9am - 5pm EST
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center size-10 rounded-full bg-white text-primary shadow-sm shrink-0">
                        <span className="material-symbols-outlined">
                          location_on
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-main">
                          Headquarters
                        </span>
                        <span className="text-base text-text-muted">
                          123 Paws Avenue
                          <br />
                          Pet City, CA 90210
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-[#D1CEC5] pt-6 mt-2">
                    <span className="text-sm font-bold text-text-main mb-4 block">
                      Follow our journey
                    </span>
                    <div className="flex gap-4">
                      <a
                        className="size-10 flex items-center justify-center rounded-full bg-text-main text-white hover:bg-primary transition-colors"
                        href="#"
                      >
                        <svg
                          aria-hidden="true"
                          className="size-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            clipRule="evenodd"
                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                            fillRule="evenodd"
                          ></path>
                        </svg>
                      </a>
                      <a
                        className="size-10 flex items-center justify-center rounded-full bg-text-main text-white hover:bg-primary transition-colors"
                        href="#"
                      >
                        <svg
                          aria-hidden="true"
                          className="size-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            clipRule="evenodd"
                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.484 2h.231zm-5.679 1.418c-1.017.051-1.57.248-1.938.397-.502.195-.873.433-1.166.726-.293.293-.531.664-.726 1.166-.149.368-.346.92-.397 1.938-.052 1.034-.06 1.343-.06 3.869v.475c0 2.505.008 2.822.06 3.846.051 1.018.248 1.57.397 1.938.195.502.433.873.726 1.166.293.293.664.531 1.166.726.368.149.92.346 1.938.397 1.034.052 1.343.06 3.869.06h.476c2.504 0 2.821-.008 3.845-.06 1.018-.051 1.57-.248 1.938-.397.502-.195.873-.433 1.166-.726.293-.293.531-.664.726-1.166.149-.368.346-.92.397-1.938.052-1.035.06-1.344.06-3.87v-.475c0-2.504-.008-2.821-.06-3.845-.051-1.018-.248-1.57-.397-1.938-.195-.502-.433-.873-.726-1.166-.293-.293-.664-.531-1.166-.726-.368-.149-.92-.346-1.938-.397-1.035-.052-1.344-.06-3.87-.06h-.475c-2.505 0-2.822.008-3.846.06zM12.337 5.837a6.162 6.162 0 110 12.324 6.162 6.162 0 010-12.324zm0 1.906a4.256 4.256 0 100 8.512 4.256 4.256 0 000-8.512zm5.336-3.26a1.418 1.418 0 110 2.836 1.418 1.418 0 010-2.836z"
                            fillRule="evenodd"
                          ></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                {/* Map Overlay */}
                <div className="h-64 w-full rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer">
                  <img
                    alt="Map showing headquarters location in Pet City"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale hover:grayscale-0"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-aiRkSeiy5fM1Fj-SGaDvgfQGaO5_-_CYiuFo7o6c1shss2f0LEaTxI97HTvrKlpL8B_FFU0bZVeTXer6sA958CFrkZBoo9u79wr48BmuVPMqOmjyB4cgZ8A_-neuusm1LvcvD2REh0amlGkruukEQoWiEv0c0ksFxs_lZdzmYxq2qoIpBhfH0jEFNIdkgFhOdF_iXkEPSVE6nzacf3F9Mrc0C5HAo3FE4fPdpRs5YElzpfvYGT17uAnahjOpOhQF-03x83-Cnvv1"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">
                      open_in_new
                    </span>
                    <span className="text-xs font-bold text-text-main">
                      Open in Maps
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="w-full bg-faq-bg py-16 px-4 md:px-10">
          <div className="max-w-[800px] mx-auto flex flex-col gap-10">
            <div className="text-center">
              <h2 className="text-text-main text-3xl font-black leading-tight tracking-[-0.015em] font-display">
                Frequently Asked Questions
              </h2>
              <p className="text-text-muted mt-3 text-lg font-body">
                Common questions about our support and services
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {[
                {
                  q: "What is the best way to contact support?",
                  a: "For general inquiries, please use the contact form above. It's the most efficient way to route your question to the right person. For urgent matters that require immediate attention, you can reach us by phone during our business hours.",
                },
                {
                  q: "How long does it take to get a response?",
                  a: "We aim to respond to all inquiries within 24-48 business hours. During peak holiday seasons, response times may be slightly longer, but we appreciate your patience as we give every message the attention it deserves.",
                },
                {
                  q: "Can I track my order status here?",
                  a: "For order status updates, please visit your account page where you can see real-time tracking information. Alternatively, you can use the tracking number provided in your shipping confirmation email to check the status directly with the carrier.",
                },
              ].map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white rounded-xl border border-[#E0DED9] shadow-sm open:shadow-md transition-all duration-300"
                >
                  <summary className="flex cursor-pointer items-center justify-between p-6 list-none [&::-webkit-details-marker]:hidden">
                    <h3 className="text-text-main font-body font-bold text-lg">
                      {faq.q}
                    </h3>
                    <span className="material-symbols-outlined text-primary transition-transform duration-300 group-open:rotate-180">
                      expand_more
                    </span>
                  </summary>
                  <div className="px-6 pb-6 pt-0 text-text-muted font-body leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
