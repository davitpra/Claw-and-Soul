import { FacebookIcon, InstagramIcon } from "@/shared/ui/SocialIcons";
import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";

export default function Contact() {
  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root">
      <Navbar />

      <main className="flex-1 flex flex-col justify-start items-center bg-white">
        <div className="layout-container w-full flex flex-col justify-start items-center py-10 lg:py-16 px-4 md:px-10">
          <div className="layout-content-container flex flex-col max-w-300 w-full gap-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
              <div className="flex max-w-150 flex-col gap-4">
                <span className="text-primary font-bold tracking-wider text-sm uppercase">
                  Support
                </span>
                <h1 className="font-display text-text-main text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
                  Get in Touch
                </h1>
                <p className="text-text-muted text-lg font-normal leading-relaxed">
                  We love hearing from fellow pet lovers. Whether it&apos;s a
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
                <div className="bg-white rounded-xl p-6 md:p-10 shadow-sm border border-[#EBE9E4]">
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
                        className="w-full rounded-xl border border-[#E0DED9] bg-[#FAFAFA] focus:bg-white focus:border-primary focus:ring-0 min-h-40 p-4 text-base text-text-main placeholder:text-text-muted/60 resize-y transition-all"
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
                <div className="bg-cream rounded-xl p-8 flex flex-col gap-8">
                  <h3 className="font-display text-xl font-black text-text-main">
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
                        aria-label="Facebook"
                        className="size-10 flex items-center justify-center rounded-full bg-text-main text-white hover:bg-primary transition-colors"
                        href="#"
                      >
                        <FacebookIcon className="size-5" />
                      </a>
                      <a
                        aria-label="Instagram"
                        className="size-10 flex items-center justify-center rounded-full bg-text-main text-white hover:bg-primary transition-colors"
                        href="#"
                      >
                        <InstagramIcon className="size-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
