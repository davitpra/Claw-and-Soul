export default function CustomerGallery() {
  const galleryItems = [
    {
      name: "Cooper",
      style: "Oil Painting Style",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwRulnRhdzhX079_FjXbRozGAqbSdb_RFMAOJDGSu8ZRiwLRVqljyCOsBGYb6bSFSyjdLAM2Z1QaD2g805d02Xa4r-x0NsqMOlCi2_FnZoynZE8Psa7cNFkNW4XHXOw-OyhklA2eCBJO1M0NbUrDETdaawC5i9l2kfJq2r1Yff3NPPODxQoJ4lKMSTXWEemVT7R07IW5iLkasL_qFbHixlxJ2yi6Y9X5j7T8AZVwDyKwl7wxAV9klFDsw8YABdoDVLSjoF0A8yk-oh",
    },
    {
      name: "Luna",
      style: "Watercolor Style",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQbcWgrNDM3FyFb8i7zwgk7zpIiZC9v_IdT686jK2gjEz1HEeJtJkhfogbxoTFT61q1haZY3r-5f4WwXx2ywyDbh---9f-_oKXraMb83m1LtXx-0I_H3y2F-AWxrHelCGsADa6Nj14SVkK3JSAJpAy6heyNe8j97Q8LNkjX14RwyHzwzzd_HZ1_oMGWygKs-kdNMrskiQYNDywy3X4vKJQVhALOVH8j9WrFFzzHR2d73_tqY7pWG4o22VbwE2ZnS0KgtUAkmQJkLlK",
    },
    {
      name: "Max",
      style: "Pop Art Style",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzgxzttGDGmKDzxIFIngEQizUccDlmyRJLRTSTylzFEf9_pNX6MwV3sAr7yfm7XdL8veXF1qCyvzoi1jO5swe1VVaRvpDFx5ZgqKmwiuk2SdD2N6kX64E8IbbjQCWtstFlEtW9YEQVhIfyA4LCU8nbbgLbyCbMW9OrlUIPndQxbb2glx1aAIbboiXUMu7dV-7j8uGNsHz2IUjaRhgnw-FeIqO7X597jlBnZhQl5PJLD0Q3tKkPmevO7qVrbl3CPiACImQkLzym7wDG",
    },
    {
      name: "Bella",
      style: "Sketch Style",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPoJbdJ3mGVdTSF6H2PDUvf0AvH_QvsDaOySKHVkryQyYOSQuZmFaMH_9YBvpZYw7qX8dM62JxYiZCkPaLHkaFaP8BcgdFSvE1TkMv8j0HJEYyzzzMeWj6CFjxURdL1-GLOw-NhIcRL9xui-6q6kLl-q3nwEbS7RfU7KRmYBAmLVdcf1EP-o7z8OR2JF8CGp9W3Bp_ws0QHSpL3WEgo9n-dvmQMZA-lMT9H5O8PZmFqOcmjYlOZXJBwXgEijqtf-JdquVS4fKkhgsZ",
    },
    {
      name: "Sir Whiskers",
      style: "Royal Portrait Style",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHeNR2rBiKdgNqJwr9p0OB2CtgE-C6GIx1dYM7n_TTpzlxow9y264GudhdhqsHyQCLxu69xp1kp-kePGTpMYuzyjmGaEzfTF1EW-M1oRZqj9nTFANWeAg8wqlAmWGBjef-C94DFGU7w9vJcYXlspzMbNmizadTVywvaGc81P9fyiE83SlIbXDNnEgdr3re64DRkcABSIVf1-Nd2R_qxmS3jHTss-xP6ZRNe4SaelTXoYPDShPfWl45WT_N784p7ipNvFbXKAbs19U4",
    },
    {
      name: "Pip",
      style: "Cartoon Style",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgfl6-ADb0SbChB2D8uSqRg3WsiidvZvPXqAtlmfUN7I-2OYOi3rFBG_R8QbUKVneGHEHlHNSmXEZU1ioqTyxxeCf8gH5gOCe1Yl8HvZg8xf9L-FQWg6wZNAC9DioJxDDrmcdDmXLorOhL9ntohc1X3H20AG9O0DahEN76YoB4RV4Lp8ugM99nHEvmsBk4BNsFXc1-OFIs5WBHwY3Iu2lkYeBDHVY9ngqhI9KMrJZafFjwBcf2vPGFA9sD_JVM63fgPo-qK89dC_dP",
    },
  ];

  return (
    <section className="py-20 bg-[#E6E2DC]">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black text-slate-dark md:text-4xl">
            Customer Gallery
          </h2>
          <p className="mt-4 text-slate-dark/70">
            Real masterpieces from happy pet parents.
          </p>
        </div>
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {galleryItems.map((item, i) => (
            <div
              key={i}
              className="break-inside-avoid rounded-2xl overflow-hidden shadow-md bg-white p-2"
            >
              <div className="w-full bg-gray-100 rounded-xl overflow-hidden">
                <img
                  alt={item.name}
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                  src={item.img}
                />
              </div>
              <div className="p-4">
                <p className="font-bold text-slate-dark">{item.name}</p>
                <p className="text-xs text-slate-dark/60">{item.style}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
