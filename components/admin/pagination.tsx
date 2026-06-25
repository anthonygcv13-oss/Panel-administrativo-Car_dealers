import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function AdminPagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const range = 1 // number of pages to show on either side of current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - range && i <= currentPage + range)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border/40 bg-white/50 dark:bg-transparent rounded-b-xl">
      <div className="text-sm text-muted-foreground font-medium">
        Mostrando página <span className="text-foreground font-semibold">{currentPage}</span> de{" "}
        <span className="text-foreground font-semibold">{totalPages}</span>
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2">
        <Button
          variant="outline"
          type="button"
          size="icon"
          className="h-8 w-8 hidden sm:flex border-border/50 hover:bg-muted"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          type="button"
          className="h-8 px-3 border-border/50 hover:bg-muted"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            )
          }

          return (
            <Button
              key={`page-${page}`}
              variant={currentPage === page ? "default" : "outline"}
              type="button"
              size="icon"
              className={`h-8 w-8 border-border/50 ${
                currentPage === page
                  ? "bg-[#C9A961] hover:bg-[#C9A961]/90 text-[#1A1F3D] font-bold shadow-sm"
                  : "hover:bg-muted"
              }`}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          )
        })}

        <Button
          variant="outline"
          type="button"
          className="h-8 px-3 border-border/50 hover:bg-muted"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="h-4 w-4 sm:ml-1" />
        </Button>
        <Button
          variant="outline"
          type="button"
          size="icon"
          className="h-8 w-8 hidden sm:flex border-border/50 hover:bg-muted"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
