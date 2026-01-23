export default function OrdersPage() {
  const orders = [
    {
      id: "#ORD-8921-XL",
      date: "Oct 24, 2023",
      total: "$85.00",
      status: "Delivered",
      statusColor: "emerald",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCx0XnfYcBzyofPRnY4hqNoTSmlZ1t5GP0W-Cx0FYRilC43yCeis24fYPW0G4QE1bmYTwr2M7aWtb0VDqy1s2m_lLlBeDbb25eXk5Hj8mmqp0_E1yAwnDZ7piRijaor0m-OzCSTKNzKeTAWoMhd8hzP9IPKVSvPLjg-JHbLzilbj_Ii3gnkB1Ji-0A6PLxngqacxGmRykjaka00rDU0NZ3hhpg-3UvIE6fKt9BCss1rBJzAcI2iglZwL7q8-Axl9LSXsNOOdCtoysCT",
    },
    {
      id: "#ORD-9920-AA",
      date: "Nov 02, 2023",
      total: "$45.00",
      status: "Shipped",
      statusColor: "blue",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDswVNS-vhw6apsp7gCsz2eskZ-r8uNIWSE7J1u1TBV1v8RWn98MqL5qGWVYVpjef5-gS552xnwDlwuXRmQuPWijaSFQyPFFjzgRM46WjEbdqRZEUzUIydF6_xg08ZDDyOWXAS4Cuhjd6VX9s3Ak_CJI2wgG-rffvRcbbP7hmBkolemZEMAiTX22h9JuY6pJ-5c5epMsaAa0sgZZYDt84vVJhRooIbgiaIeeMsWHAQrrSA_oIZ-9gVJO8WHNj5U0Ly3KgZ68QOTa1Ag",
    },
    {
      id: "#ORD-9945-BC",
      date: "Nov 05, 2023",
      total: "$120.00",
      status: "Processing",
      statusColor: "amber",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdvIiRXePzNa7YzR6ohFHLEfQ7-_0jYAWlA0mng8vpOfgUn7el3tJAyZGGLU2uZxJ8bnNVka6JF_-bcQ8ZH0ATals6ZCJmVLqdNIpcJBF8IKkYDQx3iiYRwQZdFFLoCdzD8oeAoKc37hgUoSDdrCJvPqJso4YsUXUGaURoc-wLh24lMKwmpQuVpWo61Y9oPbj0scsYQN8rJ52OYJn8Vo6BxDlVG1aL1d1WV555phmpSZW2S-6w18nIxlutbRJ-mcrA7REGapkC_Urt",
    },
    {
      id: "#ORD-6621-XZ",
      date: "Jun 05, 2023",
      total: "$32.50",
      status: "Delivered",
      statusColor: "emerald",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfV8aQAipcGos30uXurTv_DC_Aua_3_lP_ZHT00cU6TCJcUldrWk7ip23Jmx_hoiDcNAneZOsVwnpsWBvrxcaQyecIImYtB4WE7owgjXzR-P2y4NTvuGwONfdBqRCWox3F78HUcQYcA1YCJQTuviG5sszJBBxNrg-1j63wlzrYHfdKiwhx7D4mWQk3T6N5sMUXihrsqsC9ukYTERvx-JA2uJIw2favwQ488bLukcX1-G00njOWuUfZCVgYEs2JimR-CejAt1vBQYLf",
    },
  ];

  return (
    <>
      <div className="flex justify-between items-end px-4 pb-6">
        <h2 className="text-slate-dark tracking-tight text-[28px] font-bold leading-tight font-display">
          Order History
        </h2>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-10">
        {orders.map((order, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-slate-dark/5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 hover:shadow-md transition-shadow duration-300"
          >
            <div
              className="relative h-24 w-24 flex-shrink-0 bg-cream rounded-lg bg-cover bg-center shadow-inner"
              style={{ backgroundImage: `url('${order.img}')` }}
            ></div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4 w-full">
              <div className="flex flex-col justify-center">
                <p className="text-[11px] text-slate-dark/50 font-bold uppercase tracking-widest mb-1">
                  Order No.
                </p>
                <p className="text-slate-dark font-bold text-sm">{order.id}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[11px] text-slate-dark/50 font-bold uppercase tracking-widest mb-1">
                  Date
                </p>
                <p className="text-slate-dark font-medium text-sm">
                  {order.date}
                </p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[11px] text-slate-dark/50 font-bold uppercase tracking-widest mb-1">
                  Total
                </p>
                <p className="text-slate-dark font-bold text-sm">
                  {order.total}
                </p>
              </div>
              <div className="flex flex-col justify-center items-start">
                <p className="text-[11px] text-slate-dark/50 font-bold uppercase tracking-widest mb-1">
                  Status
                </p>
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border ${getStatusStyles(
                    order.statusColor
                  )}`}
                >
                  <span
                    className={`size-1.5 rounded-full ${getStatusDotStyles(
                      order.statusColor
                    )}`}
                  ></span>
                  {order.status}
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto mt-2 md:mt-0 flex-shrink-0">
              <button className="w-full md:w-auto px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm shadow-sm hover:hover:bg-primary-dark transition-all focus:ring-2 focus:ring-primary/20">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function getStatusStyles(color: string) {
  switch (color) {
    case "emerald":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "blue":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "amber":
      return "bg-amber-50 text-amber-700 border-amber-100";
    default:
      return "bg-gray-50 text-gray-700 border-gray-100";
  }
}

function getStatusDotStyles(color: string) {
  switch (color) {
    case "emerald":
      return "bg-emerald-600";
    case "blue":
      return "bg-blue-600";
    case "amber":
      return "bg-amber-600";
    default:
      return "bg-gray-600";
  }
}
