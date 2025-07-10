using BreakingNewGround.Server.DAL.SQLite.Data;
using BreakingNewGround.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BreakingNewGround.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicineController : GenericCrudController<Medicine>
    {
        public MedicineController(IGenericCrudService<Medicine> genericCrudService, ILogger<GenericCrudController<Medicine>> logger)
            : base(genericCrudService, logger)
        {
        }
    }
}