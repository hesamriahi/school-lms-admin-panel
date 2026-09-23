import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeCloseIcon, EyeIcon } from '../../../icons';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/input/InputField';
import Checkbox from '../../../components/form/input/Checkbox';
import Button from '../../../components/ui/button/Button';
import Authentication from '../../../classes/Authentication';
import { Permission } from '../../../classes/Permission';
import { ROUTES } from '../../../routes';

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Load username and password from local storage if checkbox is exists in local storage
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setIsChecked(true);
    }
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    await (new Authentication()).login(username, password);
    
    // Save username and password to local storage if checkbox is checked for next time login
    if (isChecked) {
      localStorage.setItem('rememberedUsername', username);
      localStorage.setItem('rememberedPassword', password);
    } else {
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('rememberedPassword');
    }
    
    if (Permission.check(['user'])) {
      navigate(ROUTES.userHome)
    }
    navigate('/');
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-md pt-10"></div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="text-center text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
              احراز هویت
            </h1>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              ورود به پنل مدیریت
            </p>
          </div>
          <div>
            <form onSubmit={login}>
              <div className="space-y-6">
                <div>
                  <Label>
                    نام کاربری <span className="text-error-500">*</span>{' '}
                  </Label>
                  <Input 
                    placeholder="نام کاربری خود را وارد کنید" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    رمز عبور <span className="text-error-500">*</span>{' '}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="رمز عبور خود را وارد کنید"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 left-4 z-30 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="text-theme-sm block font-normal text-gray-700 dark:text-gray-400">
                      مرا به خاطر بسپار
                    </span>
                  </div>
                </div>
                <div>
                  <Button type="submit" onClick={login} className="w-full" size="sm">
                    ورود
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
