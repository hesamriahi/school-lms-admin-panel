import UserEcommerceMetrics from '../../components/ecommerce/UserEcommerceMetrics';
import PageMeta from '../../components/common/PageMeta';
import { useNavigate } from 'react-router-dom';
import Button from "../../components/ui/button/Button.tsx";
import { PlusIcon } from "../../icons/index.ts";
import { ROUTES } from "../../routes.ts";

export default function UserHome() {
  const navigate = useNavigate();

  // const globalSettings = useSelector((state: any) => state.homeSlice.settings)

  return (
    <>
      {/* <PageMeta title={`پنل ادمین ${globalSettings?.shop_short_name}`} /> */}
      <PageMeta title={`صندوق تعاون`} />
      <Button className="mb-3" variant="success" size="sm" startIcon={<PlusIcon />} onClick={() => navigate(ROUTES.userRequestedLoans)}>
        درخواست وام
      </Button>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-12">
          <UserEcommerceMetrics />
        </div>
      </div>
    </>
  );
}
