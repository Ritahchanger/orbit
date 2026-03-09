import { useTheme } from "../../../context/theme-context/ThemeContext"; // Adjust path as needed

const CalendarView = ({ consultations }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`
            mt-8 rounded-sm p-6
            ${
              isDarkMode
                ? "bg-gray-900 border-gray-800"
                : "bg-white border-gray-200"
            } border
        `}
    >
      <h3
        className={`text-lg font-medium mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
      >
        Upcoming Consultations
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {[...Array(7)].map((_, index) => {
          const date = new Date();
          date.setDate(date.getDate() + index);
          const dateString = date.toISOString().split("T")[0];
          const dayConsultations = consultations.filter(
            (c) =>
              c.consultationDate === dateString &&
              ["pending", "confirmed"].includes(c.status),
          );

          return (
            <div
              key={index}
              className={`
                                rounded-sm p-3
                                ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}
                            `}
            >
              <div className="text-center mb-2">
                <div
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  {date.toLocaleDateString("en-KE", { weekday: "short" })}
                </div>
                <div
                  className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {date.getDate()}
                </div>
                <div
                  className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                >
                  {date.toLocaleDateString("en-KE", { month: "short" })}
                </div>
              </div>

              {dayConsultations.length > 0 ? (
                <div className="space-y-2">
                  {dayConsultations.slice(0, 3).map((consultation) => (
                    <div
                      key={consultation.id}
                      className={`rounded-sm p-2 ${isDarkMode ? "bg-gray-700" : "bg-white border border-gray-200"}`}
                    >
                      <div
                        className={`text-xs font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {consultation.customerName}
                      </div>
                      <div
                        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {consultation.consultationTime}
                      </div>
                    </div>
                  ))}

                  {dayConsultations.length > 3 && (
                    <div
                      className={`text-xs text-center ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                    >
                      +{dayConsultations.length - 3} more
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`text-xs text-center py-2 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
                >
                  No consultations
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
