import Sidebar from './Sidebar/Sidebar';
import HeaderAdmin from './HeaderAdmin/HeaderAdmin';

function AdminLayout({ children }) {
    return (
        <div className="flex w-screen h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 ml-[250px] min-w-0 flex flex-col bg-white overflow-y-auto">
                <HeaderAdmin />
                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="max-w-screen-xl mx-auto bg-white rounded-lg">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;
