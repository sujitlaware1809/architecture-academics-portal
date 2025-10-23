export async function generateMetadata({ params }: { params: { id: string } }) {
  // This is a simplified example - in a real app, you would fetch the course data based on the ID
  const mockCourseData = {
    title: "Fundamentals of Architectural Design",
    description: "Learn the fundamental principles of architectural design including composition, form, space, and structure. This course covers both theoretical concepts and practical applications.",
  };

  return {
    title: `${mockCourseData.title} | Architecture Academics`,
    description: mockCourseData.description,
  };
}

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
