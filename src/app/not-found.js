import Link from "next/link";

export default function NotFound() {
  return (
    <div className="m-auto flex flex-col justify-center items-center">
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return <span className="text-blue-500">Home</span></Link>
    </div>
  );
}
