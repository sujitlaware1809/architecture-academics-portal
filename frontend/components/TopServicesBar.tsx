"use client"

import Link from "next/link"
import { Phone, Mail } from "lucide-react"

const LINKS = [
	{ href: "/software-training", label: "Software Training" },
	{ href: "/product-manufacturer", label: "Product & Material Manufacturer" },
	{ href: "/book-seller", label: "Architectural Books" },
	{ href: "/tour-organizer", label: "Architectural Tour" },
	{ href: "/stationary-supplier", label: "Stationary Supplies" },
]

export default function TopServicesBar() {
	return (
		<div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white">
			<div className="max-w-7xl mx-auto px-4">
				<div className="flex items-center justify-between h-12">
					{/* Left: compact logo + site title */}
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-2">
							<div className="h-9 w-9 bg-white/20 rounded-lg flex items-center justify-center text-sm font-semibold text-white">AAO</div>
							<div className="leading-4">
								<div className="text-sm font-semibold">AAO</div>
								<div className="text-xs text-white/90 -mt-0.5">architecture-academics.online</div>
							</div>
						</div>
					</div>

					{/* Center: pill links */}
					<div className="flex-1 flex items-center justify-center">
						<div className="flex items-center gap-1 text-xs overflow-x-auto whitespace-nowrap">
							{LINKS.map((l, i) => (
								<div key={l.href} className="flex items-center">
									<Link
										href={l.href}
										className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/95 hover:bg-white/20 transition-colors"
									>
										{l.label}
									</Link>
									{i < LINKS.length - 1 && <span className="mx-2 text-white/40">|</span>}
								</div>
							))}
						</div>
					</div>

					{/* Right: contact with icons (aligned) */}
					  <div className="flex items-center gap-3 text-sm">
						  <a href="tel:+919876543210" className="flex items-center gap-2">
							<Phone className="h-3.5 w-3.5 text-white/90" />
							<span className="text-sm font-semibold leading-none">+91 98765 43210</span>
						</a>
						<a href="mailto:info@architecture-academics.online" className="flex items-center gap-2">
							<Mail className="h-3.5 w-3.5 text-white/90" />
							<span className="text-sm font-semibold leading-none">info@architecture-academics.online</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	)
}
