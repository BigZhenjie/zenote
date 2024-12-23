import SignUpForm from "../components/auth/SignUpForm";

const onBoarding = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen ">
      <h1 className="text-[22px] font-bold text-center">Create your profile</h1>
      <p className=" text-gray-500 mb-20 text-[22px] font-semibold">This is how you will appear in ZeNote</p>
      <SignUpForm />
    </div>
  );
};

export default onBoarding;
