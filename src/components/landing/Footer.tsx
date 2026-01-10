import React from "react";

export default function Footer() {
  return (
    <footer className="py-10 bg-white border-t mt-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
        <div>© {new Date().getFullYear()} GradeUp AI — All rights reserved.</div>
        <div className="flex items-center gap-4">
          <a className="hover:underline">Privacy</a>
          <a className="hover:underline">Terms</a>
          <a className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
}
