import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main  className="flex flex-col font-sans">
      {/* nav bar  */}
      <nav className="flex items-center justify-between px-8 py-2 shadow-sm">
        <div className="flex px-4 ">
        <Image 
        src='/next.svg'
        height={58}
        width={58}
        alt="logo"
        />
        </div>
        <div className="flex ">
          <Link href='/auth/login' className="flex px-4 py-2  mx-2 bg-black text-white rounded-4xl hover:bg-gray-900">
            Signin
          </Link>
          <Link href='/auth/sign-up' className="flex px-4 py-2  mx-2 bg-black text-white rounded-4xl hover:bg-gray-900" >
          SignUp
          </Link>
        </div>
       
       
      </nav>
       {/* hero section */}
       <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="flex p-8 items-center justify-center ">
            <h1 className="font-bold text-4xl text-black text-center text-wrap"> Introducing Folderz </h1> 
            <p className="text-base text-black text-wrap font-thin italic"> orgainize all your materials in one place </p>
          </div>

        </section>

  

    </main>
  );
}
