
import { supabase } from '../lib/supabaseClient';

const initialMembersList = [
    "Adi Tiya Yudha Peratama", "Arpi Samsul Anwar", "Bina Muhammad",
    "Christian Imanuel Ringu Langu", "Danendra Saputra", "David Riko Setiawan", "Erick Eka Prasetya",
    "Fakhri Sofyan", "Firli Fadilah Firdaus", "Galang Ramadhan", "Ghildan Nafhan Ramadhan",
    "Hagi Algi Ziad", "Hiqmal Fajryan Anwar", "Kelvin Rafael Suchyarwan", "Ksatria Faikar Nasywaan",
    "M Rafly Aryanu", "Mas Syahid Kanzul Arasy", "Muhammad Zhafir Rifqiansyah", "Naila Murni Cahyani",
    "Omar Abdullah Ali Ahmed", "Raafli Akbarfebruansyah Muchtar", "Rakha Zaidan Rizqulloh",
    "Rangga Syatir Heriza", "Rayhan Zulfikar Putra Pamungkas", "Refi Anggana Afrianto",
    "Revan Kurniawan", "Ridwan Farid Maulana", "Rifqi Athallah", "Ripan Maulana Suhur",
    "Risma Ayu Khadijah", "Rizky Fernando", "Rycko Fathur Octavian Sakti Arizona",
    "Sandy Dwi Cahyo Nugroho", "Sayyid Azfa Rasikh Dyani", "Sebastian Fikran Alhanif",
    "Tazkiya Fitriya", "Thifal Ghailan Baihaqi", "Wilda Khoeirul Anam", "Yoana Briliant Maharani",
    "Yusuf Rizqi Aulia", "Zahratul Jannah Afnur"
];

export const seedMembers = async () => {
    console.log("Starting seed...");

    // Check if data exists
    const { count } = await supabase.from('members').select('*', { count: 'exact', head: true });

    if (count && count > 0) {
        alert("Database already has members! Skipping seed.");
        return;
    }

    const membersData = initialMembersList.map(name => ({
        name: name,
        nim: '-',
        dob: '-',
        instagram: '',
        photo: ''
    }));

    const { error } = await supabase.from('members').insert(membersData);

    if (error) {
        console.error("Error seeding:", error);
        alert("Failed to seed: " + error.message);
    } else {
        alert("Success! 40 Members added to Supabase.");
        window.location.reload();
    }
};
