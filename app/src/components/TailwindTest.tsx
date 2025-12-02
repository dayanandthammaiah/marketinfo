export function TailwindTest() {
    return (
        <div className="p-8 space-y-4">
            <h1 className="text-4xl font-bold text-red-500">Tailwind Test</h1>
            <div className="bg-blue-500 text-white p-4 rounded">
                If you see this box in BLUE, Tailwind is working!
            </div>
            <div className="bg-green-500 text-white p-4 rounded">
                If you see this box in GREEN, Tailwind is working!
            </div>
            <div className="bg-md-primary text-white p-4 rounded">
                If you see this box in DARK GREEN (#006C4C), Material 3 colors are working!
            </div>
            <div className="bg-primary-600 text-white p-4 rounded">
                If you see this box in GREEN, primary-600 is working!
            </div>
        </div>
    );
}
