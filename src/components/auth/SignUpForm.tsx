import avatar from "/auth/avatar.png";

const SignUpForm = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <button className="bg-gray-100 rounded-full p-2 hover:bg-gray-50">
        <img
          src={avatar}
          alt="avatar"
          className="w-12 h-12 rounded-full opacity-10"
        />
      </button>

      <button className="p-1 px-2 hover:bg-gray-100 rounded-lg">Upload</button>

      <div className="flex flex-col items-center justify-center gap-2">
        
      </div>
    </div>
  );
};

export default SignUpForm;
