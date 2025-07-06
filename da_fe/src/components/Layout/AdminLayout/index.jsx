import Sidebar from './Sidebar/Sidebar';
import HeaderAdmin from './HeaderAdmin/HeaderAdmin';

function AdminLayout({ children }) {
    return (
        <div className="flex ">
            {' '}
            {/* Ẩn thanh cuộn ngang */}
            <Sidebar />
            <div className="flex-1 transition-all duration-300 bg-white group-hover:ml-[300px] ml-[250px]">
                <HeaderAdmin />
                <div className="p-4 min-h-screen">
                    <div className="max-w-[1500px] mx-auto bg-white rounded-lg">{children}</div>
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;
