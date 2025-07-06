import Banner from '../../../components/Layout/DefaultLayout/Banner/Banner';
import HomeSectionCarosel from './HomeSectionCarosel/HomeSectionCarosel';
import RacketInfo from './RacketInfo/RacketInfo';
import RecentNews from './RecentNews/RecentNews';

function Home() {
    return (
        <div>
            <Banner />
            <HomeSectionCarosel />
            <RecentNews />
            <RacketInfo />
        </div>
    );
}

export default Home;
