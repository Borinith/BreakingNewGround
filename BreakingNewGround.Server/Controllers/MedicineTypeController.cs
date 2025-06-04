using BreakingNewGround.Server.DAL.Data;
using BreakingNewGround.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BreakingNewGround.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicineTypeController : GenericCrudController<MedicineType>
    {
        public MedicineTypeController(IGenericCrudService<MedicineType> genericCrudService, ILogger<GenericCrudController<MedicineType>> logger)
            : base(genericCrudService, logger)
        {
        }
    }
}