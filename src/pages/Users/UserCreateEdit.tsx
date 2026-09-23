import { useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Switch from '../../components/form/switch/Switch';
import Button from '../../components/ui/button/Button';
import ApiRequest, { ApiResponse } from '../../classes/ApiRequest';
import ToastrNotification from '../../classes/ToastrNotification';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../routes';
import { useEffect } from 'react';
import Settings from '../../classes/Settings';
import { Permission } from "../../classes/Permission.ts";

export default function UserCreateEdit() {
  if (Permission.check(['super_admin']) === false) return <Navigate to={ROUTES.home} replace />;

  const { id } = useParams();
  const isUpdateMode = id ? true : false;
  const navigate = useNavigate();
  const [user, setUser] = useState({
    first_name: '',
    last_name: '',
    national_code: '',
    employment_code: '',
    mobile: '',
    is_active: true,
    extra_membership_fee: 0,
    debt: 0,
    balance: 0,
    password: ''
  });

  useEffect(() => {
    if (isUpdateMode) {
      ApiRequest.call('api/admin/users/' + id, 'GET').then((response) => {
        setUser(response.data.user);
      });
    }
  }, [isUpdateMode]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let payload: any = {
        first_name: user.first_name,
        last_name: user.last_name,
        national_code: user.national_code,
        employment_code: user.employment_code,
        mobile: user.mobile,
        is_active: user.is_active,
        extra_membership_fee: user.extra_membership_fee,
        debt: user.debt,
        balance: user.balance,
      };

      if (user.password) {
        if (user.password.length < 4) {
          ToastrNotification.error('پسورد کاربر باید بیش از ۴ کاراکتر باشد');
          return;
        }
        payload.password = user.password;
      }

      const response: ApiResponse = await ApiRequest.call(
        isUpdateMode ? 'api/admin/users/' + id : 'api/admin/users',
        isUpdateMode ? 'PUT' : 'POST',
        payload,
        null,
        true
      );

      if (response.success) {
        navigate(ROUTES.userIndex);
      } else {
        ToastrNotification.error(response.message || 'خطا در ایجاد کاربر');
      }
    } catch (error) {
      console.log('error in UserCreateEdit. on sending message. error: ', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [thisUserMemberShipFee, setThisUserMemberShipFee] = useState();
  useEffect(() => {
    setThisUserMemberShipFee((user.extra_membership_fee ?? 0) + Settings.getByName('membership_fee'));
  }, [user.extra_membership_fee, user]);

  return (
    <div>
      <PageMeta title={isUpdateMode ? "ویرایش کاربر" : "ایجاد کاربر جدید"} />
      <PageBreadcrumb pageTitle={isUpdateMode ? "ویرایش کاربر" : "ایجاد کاربر جدید"} />
      <ComponentCard title="اطلاعات کاربر">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* ردیف 1: نام (راست) | نام خانوادگی (چپ) */}
          <div>
            <Label htmlFor="user.first_name">نام</Label>
            <Input
              type="text"
              id="user.first_name"
              name="user.first_name"
              placeholder="نام را وارد کنید"
              value={user.first_name}
              onChange={(e) => setUser({ ...user, first_name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="user.last_name">نام خانوادگی</Label>
            <Input
              type="text"
              id="user.last_name"
              name="user.last_name"
              placeholder="نام خانوادگی را وارد کنید"
              value={user.last_name}
              onChange={(e) => setUser({ ...user, last_name: e.target.value })}
            />
          </div>

          {/* ردیف 2: کد ملی (راست) | کد پرسنلی (چپ) */}
          <div>
            <Label htmlFor="user.national_code">کد ملی</Label>
            <Input
              type="text"
              id="user.national_code"
              name="user.national_code"
              placeholder="کد ملی را وارد کنید"
              value={user.national_code}
              onChange={(e) => setUser({ ...user, national_code: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="user.employment_code">کد پرسنلی</Label>
            <Input
              type="text"
              id="user.employment_code"
              name="user.employment_code"
              placeholder="کد پرسنلی را وارد کنید"
              value={user.employment_code}
              onChange={(e) => setUser({ ...user, employment_code: e.target.value })}
            />
          </div>

          {/* ردیف 3: شماره همراه (راست) | وضعیت فعال (چپ) */}
          <div>
            <Label htmlFor="user.mobile">شماره همراه</Label>
            <Input
              type="text"
              id="user.mobile"
              name="user.mobile"
              placeholder="شماره همراه را وارد کنید"
              value={user.mobile}
              onChange={(e) => setUser({ ...user, mobile: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="user.extra_membership_fee">مازاد حق عضویت</Label>
            <Input
              type="text"
              id="user.extra_membership_fee"
              name="user.extra_membership_fee"
              placeholder="مازاد حق عضویت وارد کنید."
              value={user.extra_membership_fee}
              onChange={(e) => setUser({ ...user, extra_membership_fee: parseInt(e.target.value) })}
              numberFormat={true}
            />
            <p className='text-xs mr-4 mt-1 text-gray-400'>حق عضویت این کاربر: <strong>{Number(thisUserMemberShipFee).toLocaleString('fa-IR', { maximumFractionDigits: 2 })}</strong> ریال</p>
          </div>
          <div>
            <Label htmlFor="user.debt">بدهی</Label>
            <Input
              type="text"
              id="user.debt"
              name="user.debt"
              placeholder="مبلغ بدهی را وارد کنید"
              value={user.debt}
              onChange={(e) => setUser({ ...user, debt: parseInt(e.target.value) || 0 })}
              numberFormat={true}
            />
          </div>
          <div>
            <Label htmlFor="user.balance">سرمایه</Label>
            <Input
              type="text"
              id="user.balance"
              name="user.balance"
              placeholder="مبلغ سرمایه را وارد کنید"
              value={user.balance}
              onChange={(e) => setUser({ ...user, balance: parseInt(e.target.value) || 0 })}
              numberFormat={true}
            />
          </div>
          <div>
            <Label htmlFor="admin.password">رمز عبور</Label>
            <Input
              type="password"
              id="user.password"
              name="user.password"
              placeholder={isUpdateMode ? "رمز عبور جدید را وارد کنید" : 'رمز عبور کاربر را وارد کنید'}
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="user.is_active">وضعیت فعال</Label>
            <div className="mt-2">
              <Switch
                label="کاربر فعال است"
                defaultChecked={user.is_active}
                onChange={(checked) => setUser({ ...user, is_active: checked })}
              />
            </div>
          </div>
        </div>

        {/* دکمه ذخیره */}
        <div className="mt-6 flex justify-end">
          <Button
            variant="success"
            size="md"
            onClick={handleSubmit}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </div>
      </ComponentCard>
    </div>
  );
}

