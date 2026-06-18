import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NoticeService } from '../../../core/services/notice.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-notice',
  imports: [CommonModule, FormsModule],
  templateUrl: './notice.component.html'
})
export class NoticeComponent implements OnInit {
  baseUrl: string = 'https://excise.cg.nic.in/backend';
  @ViewChild('fileInput') fileInput!: ElementRef;

  notices: any[] = [];
  groupedNotices: any = {};
  years: string[] = [];
currentPage = 1;
itemsPerPage = 10;
  loading = false; // ✅ keep only once
  content = '';
  noticeDate: string = '';

  file: File | null = null;
  fileUrl: string | null = null;
  filePreviewUrl: SafeResourceUrl | null = null;
  selectedFileName: string = '';
  rawFileUrl: string = '';
  showPreview: boolean = false;
  editId: number | null = null;

  xmlData = '';
  showXml = false;
  parsedNotices: any[] = [];

  constructor(
    private noticeService: NoticeService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router
  ) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  // ngOnInit(): void {
  //   this.load();
  // this.showXml = false; // ✅ always closed on refresh
  // }
  selectedYear: number = 0;

  ngOnInit(): void {
    this.loadYears();
    this.showXml = false;
  }


  loadYears() {
    this.noticeService.getYears().subscribe({
      next: (res: number[]) => {

        this.years = res.map(x => x.toString());

        if (res.length > 0) {
          this.loadYear(res[0]);
        }
      }
    });
  }

loadYear(year: number) {

  this.selectedYear = year;

  this.currentPage = 1;

  this.noticeService.getByYear(year).subscribe({

    next: (res: any[]) => {

      this.notices = res;

      this.cdr.detectChanges();

    }

  });

}
  get paginatedNotices(): any[] {

  const start =
    (this.currentPage - 1) * this.itemsPerPage;

  const end =
    start + this.itemsPerPage;

  return this.notices.slice(start, end);
}

get totalPages(): number {

  return Math.ceil(
    this.notices.length / this.itemsPerPage
  );

}

changePage(page:number): void {

  if(
    page >= 1 &&
    page <= this.totalPages
  ){
    this.currentPage = page;
  }

}
  // 🔥 LOAD NORMAL DATA
load(): void {

  this.loading = true;

  this.noticeService.getAll().subscribe({

    next: (res: any[]) => {

      this.notices = [...res];

      this.loading = false;

      this.cdr.detectChanges();

    },

    error: () => {

      this.loading = false;

    }

  });

}
  // // Pagination functions
  // groupNoticesByYear(): void {

  //   this.groupedNotices = {};

  //   this.notices.forEach((notice: any) => {

  //     // console.log(notice);
  //     // CHANGE FIELD NAME IF NEEDED
  //     const noticeDate = notice.dateTime;


  //     const year = new Date(noticeDate)
  //       .getFullYear()
  //       .toString();

  //     if (!this.groupedNotices[year]) {
  //       this.groupedNotices[year] = [];
  //       this.currentPageByYear[year] = 1;
  //     }

  //     this.groupedNotices[year].push(notice);
  //   });

  //   this.years = Object.keys(this.groupedNotices)
  //     .sort((a: any, b: any) => Number(b) - Number(a));
  // }


  // getPaginatedNotices(year: any): any[] {

  //   if (!this.groupedNotices || !this.groupedNotices[year]) {
  //     return [];
  //   }

  //   const start =
  //     (this.currentPageByYear[year] - 1) * this.itemsPerPage;

  //   const end = start + this.itemsPerPage;

  //   return this.groupedNotices[year].slice(start, end);
  // }

  // totalPages(year: any): number {

  //   if (!this.groupedNotices || !this.groupedNotices[year]) {
  //     return 0;
  //   }

  //   return Math.ceil(
  //     this.groupedNotices[year].length / this.itemsPerPage
  //   );
  // }

  // changePage(year: any, page: number): void {

  //   if (
  //     page >= 1 &&
  //     page <= this.totalPages(year)
  //   ) {
  //     this.currentPageByYear[year] = page;
  //   }
  // }
  // 🔥 XML LOAD
  loadXml(): void {
    this.noticeService.getXml().subscribe({
      next: (res: string) => {
        this.xmlData = res;
        this.showXml = true;
        this.parseXml(res);
      },
      error: (err: any) => { // ✅ FIX
        console.error('XML Load Error:', err);
      }
    });
  }

  // 🔥 XML PARSE
  parseXml(xml: string): void {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');

    const nodes = xmlDoc.getElementsByTagName('content');

    const temp: any[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];

      temp.push({
        content: n.getAttribute('content'),
        fileUrl: n.getAttribute('Link'),
        date: n.getAttribute('date_time')
      });
    }

    this.parsedNotices = temp.reverse();
    this.cdr.detectChanges();
  }

  // 🔥 SAVE (KEEP ONLY ONE FUNCTION)
  saveNotice(): void {

    // console.log("SAVE CLICKED", this.editId);

    if (!this.content.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Content required',
        text: 'Please enter notice content'
      });
      return;
    }
    console.log('Notice Date:', this.noticeDate);

    const fd = new FormData();
    fd.append('Content', this.content);
    fd.append('NoticeDate', this.noticeDate);
    fd.append('IsHyperLink', 'true');
    fd.append('SelectLink', 'File_Link');

    // ✅ attach file only if selected
    if (this.file) {
      fd.append('File', this.file);
    }

    // ================= UPDATE =================
    if (this.editId) {

      // console.log("CALLING UPDATE API");

      this.noticeService.update(this.editId, fd).subscribe({
        next: (res: any) => {

          this.content = '';
          this.noticeDate = '';
          this.file = null;
          this.editId = null;

          this.selectedFileName = '';

          this.filePreviewUrl = null;
          this.showPreview = false;

          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }

          this.notices = [];
          this.load();

          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Updated successfully',
            showConfirmButton: false,
            timer: 2000
          });

        },
        error: (err: any) => {

          console.error("UPDATE ERROR", err);

          Swal.fire({
            icon: 'error',
            title: 'Update failed',
            text: 'Something went wrong'
          });
        }
      });

    }

    // ================= ADD =================
    else {

      // console.log("CALLING ADD API");

      if (!this.file) {
        Swal.fire({
          icon: 'warning',
          title: 'PDF required',
          text: 'Please upload a PDF file'
        });
        return;
      }

      this.noticeService.addNotice(fd).subscribe({
        next: (res: any) => {

          // console.log("ADD SUCCESS", res);

          // ✅ reset form
          this.content = '';
          this.noticeDate = '';
          this.file = null;
          this.selectedFileName = '';
          this.filePreviewUrl = null;
          this.showPreview = false;

          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }

          // ✅ refresh list
          // this.notices = [];
          this.load();

          // ✅ SUCCESS TOAST
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Added successfully',
            showConfirmButton: false,
            timer: 2000
          });

        },
        error: (err: any) => {

          console.error("ADD ERROR", err);

          Swal.fire({
            icon: 'error',
            title: 'Add failed',
            text: 'Something went wrong'
          });
        }
      });
    }
  }

  // 🔥 CLOSE XML
  closeXml(): void {
    this.showXml = false;
  }


  // 🔥 OPEN XML
  openXml(): void {
    this.loadXml();
  }


  // 🔥 FILE SELECT
  onFile(event: any): void {
    const selected = event.target.files[0];

    if (!selected) return;

    // ✅ Validate PDF only
    if (selected.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    // ✅ Store file
    this.file = selected;

    // ✅ Show file name in UI
    this.selectedFileName = selected.name;

    // ✅ Create preview URL (optional)
    const url = URL.createObjectURL(selected);
    this.filePreviewUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.rawFileUrl = url;
    // ✅ Hide preview initially (if you're using toggle)
    this.showPreview = true;
  }
  // 🔥 REMOVE FILE
  removeFile(): void {
    this.file = null;
    this.filePreviewUrl = null;
    this.showPreview = false;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  closePreview(): void {
    this.showPreview = false;
  }

  // 🔥 EDIT

  // edit(n: any): void {
  //     this.editId = n.id;
  //     this.content = n.content;

  //     if (n.fileUrl) {
  //       const baseUrl = 'http://164.100.150.78/excise/backend';

  //       const fullUrl = n.fileUrl.startsWith('http')
  //         ? n.fileUrl
  //         : baseUrl + n.fileUrl;

  //       this.filePreviewUrl =
  //         this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
  //     }

  //     this.showPreview = false;
  //     this.file = null;

  //     if (this.fileInput) {
  //       this.fileInput.nativeElement.value = '';
  //     }
  //   }  
  edit(n: any): void {
    this.editId = n.id;
    this.content = n.content;

    if (n.fileUrl) {

      let fullUrl = n.fileUrl;

      if (!n.fileUrl.startsWith('http')) {
        fullUrl = `${this.baseUrl}/${n.fileUrl.replace(/^\/+/, '')}`;
      }

      // ✅ ADD THIS LINE
      this.rawFileUrl = fullUrl;

      this.filePreviewUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
    }

    this.showPreview = false;
    this.file = null;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    setTimeout(() => {
      document
        .getElementById('editSection')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
    }, 100);

    this.noticeDate =
      n.dateTime
        ? new Date(n.dateTime)
          .toISOString()
          .split('T')[0]
        : '';

  }

  //   edit(n: any): void {
  //   this.editId = n.id;
  //   this.content = n.content;

  //   if (n.fileUrl) {

  //     let fullUrl = n.fileUrl;

  //     // 👉 If already full URL → use as is (covers 103 + 164)
  //     if (!n.fileUrl.startsWith('http')) {

  //       let baseUrl = '';

  //       // 👉 Local development
  //       if (window.location.hostname === 'localhost') {
  //         baseUrl = 'http://localhost:5115/excise/backend';
  //       }
  //       else {
  //         // 👉 Detect based on path (IMPORTANT)
  //         if (n.fileUrl.includes('ExciseNotice')) {
  //           // NEW SERVER (103)
  //           baseUrl = 'https://103.195.218.50/excise/ExciseNotice/Backend';
  //         } else {
  //           // OLD SERVER (164)
  //           baseUrl = 'http://164.100.150.78/excise/backend';
  //         }
  //       }

  //       fullUrl = baseUrl + n.fileUrl;
  //     }

  //     this.filePreviewUrl =
  //       this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
  //   }

  //   this.showPreview = false;
  //   this.file = null;

  //   if (this.fileInput) {
  //     this.fileInput.nativeElement.value = '';
  //   }
  // }

  // 🔥 DELETE
  delete(id: number): void {

    Swal.fire({
      title: 'Are you sure?',
      text: 'This notice will be deleted permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {

      if (result.isConfirmed) {

        this.noticeService.delete(id).subscribe({

          next: () => {
            // ✅ Only remove from UI when API succeeds
            this.notices = this.notices.filter(n => n.id !== id);

            if (this.showXml) {
              this.loadXml();
            }

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Deleted successfully',
              showConfirmButton: false,
              timer: 2000
            });
          },

          error: (err) => {
            // ❌ DO NOT remove from UI
            console.error(err);

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: 'Delete failed!',
              showConfirmButton: false,
              timer: 2000
            });
          }

        });

      }

    });
  }

  // /working/ openPdf(url: string): void {
  //   if (!url) return;

  //   // If already full URL → open directly
  //   if (url.startsWith('http')) {
  //     window.open(url, '_blank');
  //     return;
  //   }

  //   // BASE DOMAIN ONLY (NO /backend)
  //   const baseDomain = window.location.hostname === 'localhost'
  //     ? 'http://localhost:5115'
  //     : 'http://164.100.150.78';

  //   // If file is in uploads (NEW PATH)
  //   if (url.startsWith('/excise/uploads')) {
  //     window.open(baseDomain + url, '_blank');
  //   }
  //   else {
  //     // fallback (old data)
  //     window.open(baseDomain + '/excise/backend' + url, '_blank');
  //   }
  // }

  openPdf(url: string) {
    let fullUrl = '';

    // If already full URL → use directly
    if (url && url.startsWith('http')) {
      fullUrl = url;
    } else {
      // Clean joining (handles / properly)
      fullUrl = `${this.baseUrl}/${(url || '').replace(/^\/+/, '')}`;
    }

    // console.log('Opening PDF:', fullUrl);

    // Open in new tab
    const newTab = window.open(fullUrl, '_blank');

    // Fallback if popup blocked
    if (!newTab) {
      alert('Popup blocked! Please allow popups for this site.');
    }
  }





  // openPdf(url: string): void {
  //   if (!url) return;

  //   const baseUrl = window.location.hostname === 'localhost'
  //     ? 'http://localhost:5115/excise/backend'
  //     : 'http://164.100.150.78/excise/backend';

  //   const fileName = url.split('/').pop() || '';

  //   const openUrl = `${baseUrl}/api/notice/open?fileName=${fileName}`;
  //   window.open(openUrl, '_blank');
  // }
  resetForm(): void {
    this.content = '';
    this.file = null;
    this.filePreviewUrl = null;
    this.editId = null;
    this.showPreview = false;
    this.noticeDate = '';


    this.cdr.detectChanges();

    setTimeout(() => {
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }, 0);
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  downloadXml(): void {
    if (!this.xmlData) {
      alert('No XML data available');
      return;
    }

    const blob = new Blob([this.xmlData], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'notices.xml';
    a.click();

    window.URL.revokeObjectURL(url);
  }

  viewXml(): void {
    this.loadXml();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}