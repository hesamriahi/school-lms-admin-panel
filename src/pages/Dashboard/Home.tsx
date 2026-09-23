import EcommerceMetrics from '../../components/ecommerce/EcommerceMetrics';
// import MonthlySalesChart from '../../components/ecommerce/MonthlySalesChart';
// import StatisticsChart from '../../components/ecommerce/StatisticsChart';
// import MonthlyTarget from '../../components/ecommerce/MonthlyTarget';
// import RecentOrders from '../../components/ecommerce/RecentOrders';
// import DemographicCard from '../../components/ecommerce/DemographicCard';
import PageMeta from '../../components/common/PageMeta';
import { Permission } from '../../classes/Permission';
import UserHome from './UserHome';
// import PersianDateTimePicker from '../../components/form/DatePicker/PersianDateTimePicker';
// import PersianDateTimeRangePicker from '../../components/form/DatePicker/PersianDateTimeRangePicker';
// import {useSelector} from "react-redux";

export default function Home() {

  // const globalSettings = useSelector((state: any) => state.homeSlice.settings)

  const isUser = Permission.check(['user']);
  if (isUser) {
    return <UserHome />
  }
  
  return (
    <>
      {/* <PageMeta title={`پنل ادمین ${globalSettings?.shop_short_name}`} /> */}
      <PageMeta title={`صندوق تعاون`} />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          {Permission.check(['super_admin']) && 
            <EcommerceMetrics />
          }

          {/* <MonthlySalesChart /> */}
        </div>

        {/* <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div> */}

        <div className="col-span-12">
        {/* <PersianDateTimeRangePicker id="alskjdf" placeholder='hi'/> */}
        {/* <StatisticsChart /> */}
        </div>

        {/* <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div> */}
      </div>
    </>
  );
}
